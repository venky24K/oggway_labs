"""
Agent Router: Orchestrates session context, hybrid retrieval, skill routing,
LLM provider execution, and database persistence.
"""

import re
import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.config import settings
from backend.app.models import SessionModel, MessageModel, ArtifactModel
from backend.app.schemas import ChatRequest, ChatResponse, CitationItem, ArtifactResponse
from backend.app.rag.retriever import get_retriever
from backend.app.agent.prompts import (
    SYSTEM_GROUNDING_PROMPT,
    SHIP30_SYSTEM_PROMPT,
    ARTIFACT_SYSTEM_PROMPT,
    GREETING_SYSTEM_PROMPT,
    CLOSURE_SYSTEM_PROMPT,
    META_SYSTEM_PROMPT,
    OUT_OF_SCOPE_PROMPT
)
from backend.app.agent.skills.ship30 import build_ship30_prompt, generate_fallback_ship30_essay
from backend.app.agent.skills.artifact_maker import extract_artifact_from_text, generate_interactive_growth_calculator_html
from backend.app.agent.providers import (
    BaseLLMProvider,
    OllamaProvider,
    AnthropicProvider,
    OpenAIProvider,
    GeminiProvider,
    GroundedFallbackProvider
)

logger = logging.getLogger("lenny_assistant.router")

class AgentRouter:
    def __init__(self):
        self.retriever = get_retriever()
        self.fallback_provider = GroundedFallbackProvider()

    def classify_intent(self, message: str) -> str:
        """
        Classifies incoming user messages to route between:
        - 'greeting': Casual hello/greetings (e.g. 'hi', 'hey there', 'hello')
        - 'closure': Farewells and gratitude (e.g. 'thanks', 'bye', 'thank you')
        - 'meta': Questions about the assistant's identity, features, or architecture
        - 'out_of_scope': General non-product queries (weather, cooking, trivia)
        - 'ship30': Requests for atomic essays (~1,250 words)
        - 'artifact': Requests for interactive calculators, HTML widgets, or dashboards
        - 'domain': Grounded product management & growth queries from Lenny's archives
        """
        msg = message.strip()
        msg_lower = msg.lower()
        # Collapse 3+ repeating characters (e.g. 'hiiiiii' -> 'hii', 'heyyy' -> 'heyy')
        msg_normalized = re.sub(r'(.)\1{2,}', r'\1\1', msg_lower)

        # 1. Ship 30 Skill
        if any(phrase in msg_normalized for phrase in ["ship 30", "ship30", "atomic essay", "1250 words", "viral essay"]):
            return "ship30"

        # 2. Artifact Skill
        if any(phrase in msg_normalized for phrase in ["generate artifact", "create html", "growth calculator", "dashboard", "widget", "canvas", "interactive model"]):
            return "artifact"

        # 3. Greetings (Short conversational greetings, typos, or salutations)
        greeting_patterns = [
            r"^(hi+|hey+|hello+|helo|hlo|hllo|howdy|sup|yo|greetings?|gm|gn)[!.\s]*$",
            r"^(hi|hey|hello|helo|hlo|good morning|good afternoon|good evening|howdy)\s*(there|lenny|assistant|bot)?[!.\s\?]*$",
            r"^what'?s\s*up(\s*there)?[!.\s\?]*$",
            r"^how('s|\s+is)\s*it\s*going[!.\s\?]*$",
            r"^how\s*are\s*you(\s*doing)?[!.\s\?]*$"
        ]
        if any(re.match(p, msg_normalized) for p in greeting_patterns):
            return "greeting"

        # 4. Closures (Thanks & Goodbyes with typo tolerance)
        closure_patterns = [
            r"^(thanks?|thank\s+you|thanx|thnx)(\s+(very\s+much|so\s+much|a\s+lot))?[!.\s]*$",
            r"^(thx|cheers|appreciate\s+it|much\s+appreciated)[!.\s]*$",
            r"^(bye|goodbye|see\s+(ya|you(\s+later)?)|cya|have\s+a\s+good\s+(day|one|night)|take\s+care)[!.\s]*$"
        ]
        if any(re.match(p, msg_normalized) for p in closure_patterns):
            return "closure"

        # 5. Meta Inquiries (Capabilities, identity, architecture with shorthand tolerance)
        meta_triggers = [
            "who are you", "who r u", "who ru", "what can you do", "wat can u do", 
            "wht can u do", "what are you", "what is this app",
            "tell me about yourself", "how do you work", "what do you do",
            "what models do you support", "what is the lenny assistant"
        ]
        clean_msg = re.sub(r"[^\w\s]", "", msg_normalized).strip()
        if any(clean_msg == trigger or msg_normalized.startswith(trigger) for trigger in meta_triggers):
            return "meta"

        # 6. Out-of-scope trivia / non-product inquiries
        out_of_scope_patterns = [
            r"^(what is the weather|weather in|how is the weather)",
            r"^(what is the capital of|who is the president of|who won the)",
            r"^(how (do|to) (make|cook|bake)|recipe for)",
            r"^(tell me a joke|sing a song|write a poem about)"
        ]
        if any(re.search(p, msg_lower) for p in out_of_scope_patterns):
            return "out_of_scope"

        # 7. Default to domain RAG
        return "domain"

    async def get_provider(self, requested_provider: Optional[str] = None, model: Optional[str] = None) -> Tuple[BaseLLMProvider, str]:
        """
        Resolves the appropriate LLM provider with graceful fallback.
        """
        provider_name = (requested_provider or settings.DEFAULT_PROVIDER).lower()

        # If requested_provider was not explicitly specified, infer from model name prefix
        if not requested_provider:
            if model and model.startswith("gemini"):
                provider_name = "gemini"
            elif model and model.startswith("claude"):
                provider_name = "anthropic"
            elif model and (model.startswith("gpt") or model.startswith("o1")):
                provider_name = "openai"

        if provider_name == "ollama":
            ollama = OllamaProvider(model=model)
            if await ollama.check_health():
                return ollama, f"ollama ({model or settings.OLLAMA_MODEL})"
            logger.info("Ollama is not running or unreachable at %s. Falling back to GroundedFallbackProvider.", settings.OLLAMA_BASE_URL)
            return self.fallback_provider, "fallback (ollama offline)"

        elif provider_name == "gemini":
            gemini = GeminiProvider(model=model)
            if await gemini.check_health():
                return gemini, f"gemini ({model or settings.GEMINI_MODEL})"
            logger.info("Gemini API key is not configured. Falling back to GroundedFallbackProvider.")
            return self.fallback_provider, "fallback (gemini key missing)"

        elif provider_name == "anthropic":
            anthropic = AnthropicProvider(model=model)
            if await anthropic.check_health():
                return anthropic, f"anthropic ({model or settings.ANTHROPIC_MODEL})"
            logger.info("Anthropic API key is not configured. Falling back to GroundedFallbackProvider.")
            return self.fallback_provider, "fallback (anthropic key missing)"

        elif provider_name == "openai":
            openai = OpenAIProvider(model=model)
            if await openai.check_health():
                return openai, f"openai ({model or settings.OPENAI_MODEL})"
            logger.info("OpenAI API key is not configured. Falling back to GroundedFallbackProvider.")
            return self.fallback_provider, "fallback (openai key missing)"

        return self.fallback_provider, "fallback"

    async def process_chat(self, req: ChatRequest, db: AsyncSession) -> ChatResponse:
        """
        End-to-end chat orchestration pipeline with intent-based routing.
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

        # 3. Classify Intent
        intent = self.classify_intent(req.message)
        is_ship30 = req.generate_ship30 or intent == "ship30"
        is_artifact = req.generate_artifact or intent == "artifact"
        is_conversational = intent in ["greeting", "closure", "meta", "out_of_scope"]

        citations: List[CitationItem] = []
        context_str = ""

        # 4. Context Retrieval (ONLY execute for domain / podcast queries)
        if not is_conversational:
            search_results = self.retriever.search(query=req.message, top_k=5)
            context_str = self.retriever.format_context_for_prompt(search_results)

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

        # 5. Resolve Provider
        provider, provider_label = await self.get_provider(req.provider, req.model)

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

        # 6. Execute Specific Intent, Skill, or Grounded RAG
        if is_conversational:
            if isinstance(provider, GroundedFallbackProvider):
                if intent == "greeting":
                    assistant_content = "Hello! How can I help you with product management, growth strategy, or Lenny's Podcast insights today?"
                elif intent == "closure":
                    assistant_content = "You're very welcome! Let me know if you need anything else. Best of luck building!"
                elif intent == "meta":
                    assistant_content = (
                        "I am **The Lenny Growth Assistant**, an AI advisor indexing insights from 300+ episodes of Lenny's Podcast. "
                        "I can help you explore tactical product frameworks with timestamped citations, write Ship 30 atomic essays, "
                        "or generate interactive growth models. What challenge are you working on?"
                    )
                else:  # out_of_scope
                    assistant_content = (
                        "I'm specialized in product management, growth strategy, and lessons from Lenny's Podcast archives. "
                        "What product or growth challenge can I help you explore today?"
                    )
            else:
                prompt_map = {
                    "greeting": GREETING_SYSTEM_PROMPT,
                    "closure": CLOSURE_SYSTEM_PROMPT,
                    "meta": META_SYSTEM_PROMPT,
                    "out_of_scope": OUT_OF_SCOPE_PROMPT,
                }
                selected_prompt = prompt_map.get(intent, GREETING_SYSTEM_PROMPT)
                assistant_content = await provider.generate_response(
                    system_prompt=selected_prompt,
                    messages=formatted_history,
                    context_str=""
                )

        elif is_ship30:
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
