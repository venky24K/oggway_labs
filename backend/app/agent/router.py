"""
Agent Router: Orchestrates session context, hybrid retrieval, skill routing,
LLM provider execution, and database persistence.
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.config import settings
from backend.app.models import SessionModel, MessageModel, ArtifactModel
from backend.app.schemas import ChatRequest, ChatResponse, CitationItem, ArtifactResponse
from backend.app.rag.retriever import get_retriever
from backend.app.agent.prompts import SYSTEM_GROUNDING_PROMPT, SHIP30_SYSTEM_PROMPT, ARTIFACT_SYSTEM_PROMPT
from backend.app.agent.skills.ship30 import build_ship30_prompt, generate_fallback_ship30_essay
from backend.app.agent.skills.artifact_maker import extract_artifact_from_text, generate_interactive_growth_calculator_html
from backend.app.agent.providers import (
    BaseLLMProvider,
    OllamaProvider,
    AnthropicProvider,
    OpenAIProvider,
    GroundedFallbackProvider
)

logger = logging.getLogger("lenny_assistant.agent")

class AgentRouter:
    def __init__(self):
        self.retriever = get_retriever()
        self.fallback_provider = GroundedFallbackProvider()

    async def get_provider(self, requested_provider: Optional[str] = None, model: Optional[str] = None) -> Tuple[BaseLLMProvider, str]:
        """
        Resolves the appropriate LLM provider with graceful fallback.
        """
        provider_name = (requested_provider or settings.DEFAULT_PROVIDER).lower()

        if provider_name == "ollama":
            ollama = OllamaProvider(model=model)
            if await ollama.check_health():
                return ollama, "ollama"
            logger.info("Ollama is not running or unreachable at %s. Falling back to GroundedFallbackProvider.", settings.OLLAMA_BASE_URL)
            return self.fallback_provider, "fallback (ollama offline)"

        elif provider_name == "anthropic":
            anthropic = AnthropicProvider(model=model)
            if await anthropic.check_health():
                return anthropic, "anthropic"
            logger.info("Anthropic API key is not configured. Falling back to GroundedFallbackProvider.")
            return self.fallback_provider, "fallback (anthropic key missing)"

        elif provider_name == "openai":
            openai = OpenAIProvider(model=model)
            if await openai.check_health():
                return openai, "openai"
            logger.info("OpenAI API key is not configured. Falling back to GroundedFallbackProvider.")
            return self.fallback_provider, "fallback (openai key missing)"

        return self.fallback_provider, "fallback"

    async def process_chat(self, req: ChatRequest, db: AsyncSession) -> ChatResponse:
        """
        End-to-end chat orchestration pipeline.
        """
        # 1. Resolve or Create Session
        if req.session_id:
            result = await db.execute(select(SessionModel).where(SessionModel.id == req.session_id))
            session_obj = result.scalars().first()
            if not session_obj:
                session_obj = SessionModel(id=req.session_id)
                db.add(session_obj)
        else:
            session_obj = SessionModel()
            db.add(session_obj)
            await db.flush()

        session_id = session_obj.id

        # 2. Persist User Message
        user_msg = MessageModel(
            session_id=session_id,
            role="user",
            content=req.message
        )
        db.add(user_msg)
        await db.flush()

        # 3. Retrieve Context from Lenny's Transcripts
        search_results = self.retriever.search(query=req.message, top_k=5)
        context_str = self.retriever.format_context_for_prompt(search_results)

        # Convert citations to Pydantic objects
        citations = [
            CitationItem(
                chunk_id=r.get("chunk_id"),
                guest=r.get("guest", "Unknown"),
                title=r.get("title", "Episode"),
                timestamp=r.get("timestamp", "00:00"),
                start_seconds=r.get("start_seconds", 0),
                youtube_url=r.get("youtube_url", ""),
                snippet=r.get("snippet", ""),
                score=r.get("score")
            )
            for r in search_results
        ]

        # 4. Resolve Provider
        provider, provider_label = await self.get_provider(req.provider, req.model)

        # 5. Detect Skills / Intent
        is_ship30 = req.generate_ship30 or any(
            phrase in req.message.lower() 
            for phrase in ["ship 30", "ship30", "atomic essay", "1250 words", "viral essay"]
        )
        is_artifact = req.generate_artifact or any(
            phrase in req.message.lower() 
            for phrase in ["generate artifact", "create html", "calculator", "dashboard", "widget", "canvas", "interactive model"]
        )

        artifact_data: Optional[Dict[str, str]] = None
        assistant_content = ""

        # Fetch conversation history for session continuity
        hist_result = await db.execute(
            select(MessageModel)
            .where(MessageModel.session_id == session_id)
            .order_by(MessageModel.created_at.desc())
            .limit(6)
        )
        recent_messages = list(reversed(hist_result.scalars().all()))
        formatted_history = [{"role": m.role, "content": m.content} for m in recent_messages]

        # 6. Execute Specific Skill or Standard Grounded RAG
        if is_ship30:
            if isinstance(provider, GroundedFallbackProvider):
                citations_dict = [c.model_dump() for c in citations]
                assistant_content = generate_fallback_ship30_essay(req.message, citations_dict)
            else:
                prompt = build_ship30_prompt(req.message, context_str)
                assistant_content = await provider.generate_response(
                    system_prompt=SHIP30_SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": prompt}],
                    context_str=context_str
                )

        elif is_artifact:
            primary_guest = citations[0].guest if citations else "Lenny Rachitsky"
            if isinstance(provider, GroundedFallbackProvider):
                artifact_dict = generate_interactive_growth_calculator_html(req.message, primary_guest)
                artifact_data = artifact_dict
                assistant_content = (
                    f"I have created an interactive **{artifact_dict['title']}** based on frameworks from "
                    f"**{primary_guest}** on Lenny's Podcast.\n\n"
                    f"The live widget is rendered in the **Artifact Viewer** to the right. "
                    f"You can adjust visitor traffic, activation rates, and churn to model steady-state ARR, "
                    f"or inspect and copy the isolated HTML/CSS code."
                )
            else:
                enhanced_prompt = (
                    f"{req.message}\n\nPlease generate a complete, self-contained HTML/CSS/JS interactive artifact "
                    f"grounded in the following podcast material:\n{context_str}"
                )
                assistant_content = await provider.generate_response(
                    system_prompt=ARTIFACT_SYSTEM_PROMPT,
                    messages=formatted_history + [{"role": "user", "content": enhanced_prompt}],
                    context_str=context_str
                )
                artifact_data = extract_artifact_from_text(assistant_content)

        else:
            # Standard Grounded Conversational Q&A
            assistant_content = await provider.generate_response(
                system_prompt=SYSTEM_GROUNDING_PROMPT,
                messages=formatted_history,
                context_str=context_str
            )
            # Check if an artifact was generated inside standard response
            artifact_data = extract_artifact_from_text(assistant_content)

        # 7. Persist Assistant Message
        assistant_msg = MessageModel(
            session_id=session_id,
            role="assistant",
            content=assistant_content,
            citations_json=[c.model_dump() for c in citations],
            model_used=provider_label
        )
        db.add(assistant_msg)
        await db.flush()

        # 8. Persist Artifact if Generated
        artifact_response = None
        if artifact_data:
            artifact_model = ArtifactModel(
                session_id=session_id,
                message_id=assistant_msg.id,
                title=artifact_data.get("title", "Growth Artifact"),
                artifact_type=artifact_data.get("artifact_type", "html"),
                content=artifact_data.get("content", "")
            )
            db.add(artifact_model)
            await db.flush()
            artifact_response = ArtifactResponse.model_validate(artifact_model)

        # 9. Update Session Title if First Interaction
        if len(recent_messages) <= 2:
            session_obj.title = req.message[:50].strip() + ("..." if len(req.message) > 50 else "")

        await db.commit()

        return ChatResponse(
            session_id=session_id,
            message=assistant_content,
            citations=citations,
            artifact=artifact_response,
            model_used=getattr(provider, "model", "grounded-fallback"),
            provider=provider_label,
            grounded=bool(citations)
        )

# Singleton instance
agent_router = AgentRouter()
