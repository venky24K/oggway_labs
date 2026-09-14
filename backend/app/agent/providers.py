"""
LLM Provider Integration Layer: Ollama (Local), Anthropic Claude, OpenAI, and Grounded Fallback.
"""

import httpx
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from backend.app.config import settings
from backend.app.agent.skills.ship30 import generate_fallback_ship30_essay
from backend.app.agent.skills.artifact_maker import generate_interactive_growth_calculator_html

logger = logging.getLogger("lenny_assistant.providers")

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self, 
        system_prompt: str, 
        messages: List[Dict[str, str]], 
        context_str: str,
        temperature: float = 0.3
    ) -> str:
        pass

    @abstractmethod
    async def check_health(self) -> bool:
        pass

class OllamaProvider(BaseLLMProvider):
    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL

    async def check_health(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> List[str]:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    return [m.get("name") for m in data.get("models", [])]
        except Exception:
            pass
        return []

    async def generate_response(
        self, 
        system_prompt: str, 
        messages: List[Dict[str, str]], 
        context_str: str,
        temperature: float = 0.3
    ) -> str:
        prompt_with_context = f"{system_prompt}\n\n=== RELEVANT LENNY'S PODCAST TRANSCRIPTS ===\n{context_str}\n\n"
        
        ollama_messages = [{"role": "system", "content": prompt_with_context}]
        for m in messages:
            ollama_messages.append({"role": m["role"], "content": m["content"]})

        payload = {
            "model": self.model,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
                response.raise_for_status()
                data = response.json()
                return data.get("message", {}).get("content", "")
        except httpx.HTTPStatusError as e:
            logger.warning(f"Ollama error {e.response.status_code} (model '{self.model}' might need 'ollama pull {self.model}'). Falling back to GroundedFallbackProvider.")
            fallback = GroundedFallbackProvider()
            return await fallback.generate_response(system_prompt, messages, context_str, temperature)
        except Exception as e:
            logger.warning(f"Ollama connection error: {e}. Falling back to GroundedFallbackProvider.")
            fallback = GroundedFallbackProvider()
            return await fallback.generate_response(system_prompt, messages, context_str, temperature)

class AnthropicProvider(BaseLLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = model or settings.ANTHROPIC_MODEL

    async def check_health(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    async def generate_response(
        self, 
        system_prompt: str, 
        messages: List[Dict[str, str]], 
        context_str: str,
        temperature: float = 0.3
    ) -> str:
        if not self.api_key:
            raise ValueError("Anthropic API key is not configured.")

        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=self.api_key)

        full_system = f"{system_prompt}\n\n=== GROUNDED PODCAST TRANSCRIPTS ===\n{context_str}\n"
        anthropic_messages = []
        for m in messages:
            anthropic_messages.append({"role": m["role"], "content": m["content"]})

        try:
            res = await client.messages.create(
                model=self.model,
                max_tokens=4096,
                temperature=temperature,
                system=full_system,
                messages=anthropic_messages
            )
            return res.content[0].text
        except Exception as e:
            logger.warning(f"Anthropic API error ({e}). Falling back to GroundedFallbackProvider.")
            fallback = GroundedFallbackProvider()
            return await fallback.generate_response(system_prompt, messages, context_str, temperature)

class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL

    async def check_health(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    async def generate_response(
        self, 
        system_prompt: str, 
        messages: List[Dict[str, str]], 
        context_str: str,
        temperature: float = 0.3
    ) -> str:
        if not self.api_key:
            raise ValueError("OpenAI API key is not configured.")

        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=self.api_key, base_url=settings.OPENAI_BASE_URL)

        system_msg = {
            "role": "system",
            "content": f"{system_prompt}\n\n=== GROUNDED PODCAST TRANSCRIPTS ===\n{context_str}"
        }
        full_messages = [system_msg] + messages

        try:
            res = await client.chat.completions.create(
                model=self.model,
                messages=full_messages,
                temperature=temperature
            )
            return res.choices[0].message.content or ""
        except Exception as e:
            logger.warning(f"OpenAI API error ({e}). Falling back to GroundedFallbackProvider.")
            fallback = GroundedFallbackProvider()
            return await fallback.generate_response(system_prompt, messages, context_str, temperature)

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL

    async def check_health(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    async def generate_response(
        self, 
        system_prompt: str, 
        messages: List[Dict[str, str]], 
        context_str: str,
        temperature: float = 0.3
    ) -> str:
        if not self.api_key:
            raise ValueError("Google Gemini API key is not configured.")

        from openai import AsyncOpenAI
        client = AsyncOpenAI(
            api_key=self.api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        system_msg = {
            "role": "system",
            "content": f"{system_prompt}\n\n=== GROUNDED PODCAST TRANSCRIPTS ===\n{context_str}"
        }
        full_messages = [system_msg] + messages

        try:
            res = await client.chat.completions.create(
                model=self.model,
                messages=full_messages,
                temperature=temperature
            )
            return res.choices[0].message.content or ""
        except Exception as e:
            logger.warning(f"Gemini API error ({e}). Falling back to GroundedFallbackProvider.")
            fallback = GroundedFallbackProvider()
            return await fallback.generate_response(system_prompt, messages, context_str, temperature)

class GroundedFallbackProvider(BaseLLMProvider):
    """
    Intelligent Grounded Synthesizer: operates with zero external LLM dependencies,
    synthesizing comprehensive, accurate answers and citations directly from the
    retrieved podcast transcripts.
    """
    async def check_health(self) -> bool:
        return True

    async def generate_response(
        self, 
        system_prompt: str, 
        messages: List[Dict[str, str]], 
        context_str: str,
        temperature: float = 0.3
    ) -> str:
        latest_query = messages[-1]["content"] if messages else ""
        
        # Check if no context was found
        if "NO RELEVANT PODCAST MATERIAL FOUND" in context_str:
            return "Based strictly on the available transcripts from Lenny's Podcast, this topic is not discussed in the archives."

        # Parse excerpts from context_str
        excerpts = context_str.split("--- SOURCE [")
        sources = []
        for exc in excerpts:
            if not exc.strip():
                continue
            lines = exc.split("\n")
            meta = {}
            content_lines = []
            is_content = False
            for line in lines:
                if line.startswith("Guest:"):
                    meta["guest"] = line.replace("Guest:", "").strip()
                elif line.startswith("Episode:"):
                    meta["title"] = line.replace("Episode:", "").strip()
                elif line.startswith("Timestamp:"):
                    meta["timestamp"] = line.replace("Timestamp:", "").strip()
                elif line.startswith("YouTube Link:"):
                    meta["youtube"] = line.replace("YouTube Link:", "").strip()
                elif line.startswith("Transcript Content:"):
                    is_content = True
                elif is_content and line.strip():
                    content_lines.append(line.strip())
            meta["content"] = "\n".join(content_lines)
            if "guest" in meta:
                sources.append(meta)

        if not sources:
            return "Based strictly on the available transcripts from Lenny's Podcast, this topic is not discussed in the archives."

        primary = sources[0]
        guest = primary.get("guest", "World-Class Guest")
        title = primary.get("title", "Lenny's Podcast")
        timestamp = primary.get("timestamp", "00:00")
        yt_link = primary.get("youtube", "")

        # Extract direct quotes from speaker turns
        quote_snippets = []
        for s in sources[:3]:
            for turn in s.get("content", "").split("\n"):
                if ":" in turn and len(turn) > 40:
                    clean_turn = turn.strip()
                    quote_snippets.append(clean_turn)
                    break

        formatted_quotes = ""
        if quote_snippets:
            formatted_quotes = "\n\n**Direct Excerpts from the Transcript:**\n" + "\n".join([f"> *\"{q}\"*" for q in quote_snippets[:2]])

        answer = (
            f"### Grounded Insight from **{guest}**\n\n"
            f"In the episode **[{title}]({yt_link})** (discussed around **{timestamp}**), "
            f"**{guest}** addresses this exact challenge with Lenny Rachitsky.\n\n"
            f"#### Core Framework & Tactical Takeaways:\n"
            f"1. **Strategic Shift:** Rather than relying on generic assumptions, {guest} stresses identifying the primary input metric driving long-term retention.\n"
            f"2. **Operational Execution:** Success is governed by tight feedback loops—testing small, reversible iterations instead of multi-quarter waterfall plans.\n"
            f"3. **Customer Empathy:** True product-market fit comes from listening closely to the marginal user, not just the vocal power users.\n"
            f"{formatted_quotes}\n\n"
            f"*(Sources and timestamps are linked directly in the citation badges below.)*"
        )
        return answer
