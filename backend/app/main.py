"""
FastAPI Main Application for The Lenny Growth Assistant
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.app.config import settings
from backend.app.database import get_db, init_db, using_sqlite, reinit_database
from backend.app.models import SessionModel, MessageModel, ArtifactModel
from backend.app.schemas import (
    SessionResponse,
    SessionCreate,
    ChatRequest,
    ChatResponse,
    ModelStatusResponse,
    ArtifactResponse
)
from backend.app.rag.retriever import get_retriever
from backend.app.agent.router import agent_router
from backend.app.agent.providers import OllamaProvider

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lenny_assistant.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info("Initializing The Lenny Growth Assistant backend...")
    # 1. Initialize DB tables
    await init_db()
    # 2. Warm up RAG index
    retriever = get_retriever()
    logger.info(f"Loaded retriever with {len(retriever.chunks)} transcript chunks.")
    yield
    logger.info("Shutting down backend...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise AI Assistant grounded in Lenny's Podcast Transcripts with Artifact Viewer & Ship 30 for 30 Skill.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Health & Status Endpoints ----------------- #

@app.get(f"{settings.API_PREFIX}/health", tags=["System"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health endpoint returning DB status, Ollama status, and index health."""
    retriever = get_retriever()
    ollama = OllamaProvider()
    ollama_ok = await ollama.check_health()
    
    # Check DB
    db_ok = True
    try:
        await db.execute(select(1))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "app_name": settings.APP_NAME,
        "database_connected": db_ok,
        "database_type": "sqlite" if using_sqlite else "postgresql",
        "ollama_available": ollama_ok,
        "indexed_episodes": len(retriever.catalog),
        "indexed_chunks": len(retriever.chunks)
    }

@app.get(f"{settings.API_PREFIX}/models", response_model=ModelStatusResponse, tags=["System"])
async def get_models_status(endpoint: Optional[str] = None):
    """Returns available model providers, Ollama status, and models."""
    retriever = get_retriever()
    ollama_url = endpoint or settings.OLLAMA_BASE_URL
    ollama = OllamaProvider(base_url=ollama_url)
    ollama_ok = await ollama.check_health()
    ollama_models = await ollama.list_models() if ollama_ok else []

    available = ["fallback"]
    if ollama_ok:
        available.append("ollama")
    if settings.ANTHROPIC_API_KEY and len(settings.ANTHROPIC_API_KEY.strip()) > 5:
        available.append("anthropic")
    if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 5:
        available.append("openai")
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5:
        available.append("gemini")

    active_model = "fallback-rag"
    if settings.DEFAULT_PROVIDER == "ollama":
        active_model = settings.OLLAMA_MODEL
    elif settings.DEFAULT_PROVIDER == "openai":
        active_model = settings.OPENAI_MODEL
    elif settings.DEFAULT_PROVIDER == "anthropic":
        active_model = settings.ANTHROPIC_MODEL
    elif settings.DEFAULT_PROVIDER == "gemini":
        active_model = settings.GEMINI_MODEL

    return ModelStatusResponse(
        ollama_available=ollama_ok,
        ollama_models=ollama_models,
        current_provider=settings.DEFAULT_PROVIDER,
        current_model=active_model,
        available_providers=available,
        database_connected=True,
        database_type="sqlite" if using_sqlite else "postgresql",
        indexed_episodes=len(retriever.catalog),
        indexed_chunks=len(retriever.chunks)
    )

from pydantic import BaseModel

def mask_api_key(key: Optional[str]) -> str:
    if not key or len(key.strip()) < 6:
        return ""
    clean = key.strip()
    return f"{clean[:4]}...{clean[-4:]}"

def persist_settings_to_env(updates: dict):
    env_path = ".env"
    if not os.path.exists(env_path):
        return
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        updated_keys = set()
        new_lines = []
        for line in lines:
            stripped = line.strip()
            if stripped and not stripped.startswith("#") and "=" in stripped:
                k = stripped.split("=", 1)[0].strip()
                if k in updates:
                    new_lines.append(f"{k}={updates[k]}\n")
                    updated_keys.add(k)
                    continue
            new_lines.append(line)

        for k, v in updates.items():
            if k not in updated_keys and v is not None:
                new_lines.append(f"{k}={v}\n")

        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        logger.warning("Could not persist to .env: %s", e)

class SettingsUpdatePayload(BaseModel):
    provider: Optional[str] = None
    ollama_url: Optional[str] = None
    ollama_model: Optional[str] = None
    openai_key: Optional[str] = None
    openai_model: Optional[str] = None
    openai_base_url: Optional[str] = None
    clear_openai_key: Optional[bool] = False
    anthropic_key: Optional[str] = None
    anthropic_model: Optional[str] = None
    clear_anthropic_key: Optional[bool] = False
    gemini_key: Optional[str] = None
    gemini_model: Optional[str] = None
    clear_gemini_key: Optional[bool] = False
    database_url: Optional[str] = None

@app.get(f"{settings.API_PREFIX}/settings", tags=["System"])
async def get_settings():
    """Returns current server settings and configuration state."""
    active_model = "fallback-rag"
    if settings.DEFAULT_PROVIDER == "ollama":
        active_model = settings.OLLAMA_MODEL
    elif settings.DEFAULT_PROVIDER == "openai":
        active_model = settings.OPENAI_MODEL
    elif settings.DEFAULT_PROVIDER == "anthropic":
        active_model = settings.ANTHROPIC_MODEL
    elif settings.DEFAULT_PROVIDER == "gemini":
        active_model = settings.GEMINI_MODEL

    return {
        "provider": settings.DEFAULT_PROVIDER,
        "current_model": active_model,
        "ollama_url": settings.OLLAMA_BASE_URL,
        "ollama_model": settings.OLLAMA_MODEL,
        "openai_model": settings.OPENAI_MODEL,
        "openai_base_url": settings.OPENAI_BASE_URL or "",
        "anthropic_model": settings.ANTHROPIC_MODEL,
        "gemini_model": settings.GEMINI_MODEL,
        "database_url": settings.DATABASE_URL or "",
        "has_openai_key": bool(settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 5),
        "has_anthropic_key": bool(settings.ANTHROPIC_API_KEY and len(settings.ANTHROPIC_API_KEY.strip()) > 5),
        "has_gemini_key": bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5),
        "openai_key_preview": mask_api_key(settings.OPENAI_API_KEY),
        "anthropic_key_preview": mask_api_key(settings.ANTHROPIC_API_KEY),
        "gemini_key_preview": mask_api_key(settings.GEMINI_API_KEY),
        "database_type": "sqlite" if using_sqlite else "postgresql"
    }

@app.post(f"{settings.API_PREFIX}/settings", tags=["System"])
async def update_settings(payload: SettingsUpdatePayload):
    """Updates runtime configuration in memory and persists to .env."""
    env_updates = {}

    if payload.provider:
        settings.DEFAULT_PROVIDER = payload.provider
        env_updates["DEFAULT_PROVIDER"] = payload.provider
    if payload.ollama_url and payload.ollama_url.strip():
        settings.OLLAMA_BASE_URL = payload.ollama_url.strip()
        env_updates["OLLAMA_BASE_URL"] = payload.ollama_url.strip()
    if payload.ollama_model and payload.ollama_model.strip():
        settings.OLLAMA_MODEL = payload.ollama_model.strip()
        env_updates["OLLAMA_MODEL"] = payload.ollama_model.strip()

    # OpenAI
    if payload.clear_openai_key:
        settings.OPENAI_API_KEY = ""
        env_updates["OPENAI_API_KEY"] = ""
    elif payload.openai_key and payload.openai_key.strip():
        settings.OPENAI_API_KEY = payload.openai_key.strip()
        env_updates["OPENAI_API_KEY"] = payload.openai_key.strip()

    if payload.openai_model:
        settings.OPENAI_MODEL = payload.openai_model
        env_updates["OPENAI_MODEL"] = payload.openai_model
    if payload.openai_base_url is not None:
        val = payload.openai_base_url.strip() or None
        settings.OPENAI_BASE_URL = val
        env_updates["OPENAI_BASE_URL"] = val or ""

    # Anthropic
    if payload.clear_anthropic_key:
        settings.ANTHROPIC_API_KEY = ""
        env_updates["ANTHROPIC_API_KEY"] = ""
    elif payload.anthropic_key and payload.anthropic_key.strip():
        settings.ANTHROPIC_API_KEY = payload.anthropic_key.strip()
        env_updates["ANTHROPIC_API_KEY"] = payload.anthropic_key.strip()

    if payload.anthropic_model:
        settings.ANTHROPIC_MODEL = payload.anthropic_model
        env_updates["ANTHROPIC_MODEL"] = payload.anthropic_model

    # Gemini
    if payload.clear_gemini_key:
        settings.GEMINI_API_KEY = ""
        env_updates["GEMINI_API_KEY"] = ""
    elif payload.gemini_key and payload.gemini_key.strip():
        settings.GEMINI_API_KEY = payload.gemini_key.strip()
        env_updates["GEMINI_API_KEY"] = payload.gemini_key.strip()

    if payload.gemini_model:
        settings.GEMINI_MODEL = payload.gemini_model
        env_updates["GEMINI_MODEL"] = payload.gemini_model

    # Database
    if payload.database_url and payload.database_url.strip():
        new_db = payload.database_url.strip()
        settings.DATABASE_URL = new_db
        env_updates["DATABASE_URL"] = new_db
        await reinit_database(new_db)

    # Persist to .env
    if env_updates:
        persist_settings_to_env(env_updates)

    available = ["fallback"]
    ollama = OllamaProvider(base_url=settings.OLLAMA_BASE_URL)
    if await ollama.check_health():
        available.append("ollama")
    if settings.ANTHROPIC_API_KEY and len(settings.ANTHROPIC_API_KEY.strip()) > 5:
        available.append("anthropic")
    if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 5:
        available.append("openai")
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5:
        available.append("gemini")

    active_model = "fallback-rag"
    if settings.DEFAULT_PROVIDER == "ollama":
        active_model = settings.OLLAMA_MODEL
    elif settings.DEFAULT_PROVIDER == "openai":
        active_model = settings.OPENAI_MODEL
    elif settings.DEFAULT_PROVIDER == "anthropic":
        active_model = settings.ANTHROPIC_MODEL
    elif settings.DEFAULT_PROVIDER == "gemini":
        active_model = settings.GEMINI_MODEL

    return {
        "status": "success",
        "current_provider": settings.DEFAULT_PROVIDER,
        "current_model": active_model,
        "available_providers": available,
        "database_type": "sqlite" if using_sqlite else "postgresql"
    }

# ----------------- Session Endpoints ----------------- #

@app.get(f"{settings.API_PREFIX}/sessions", response_model=List[SessionResponse], tags=["Sessions"])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    """Lists all chat sessions ordered by last update."""
    result = await db.execute(
        select(SessionModel)
        .options(selectinload(SessionModel.messages), selectinload(SessionModel.artifacts))
        .order_by(SessionModel.updated_at.desc())
    )
    sessions = result.scalars().all()
    return sessions

@app.post(f"{settings.API_PREFIX}/sessions", response_model=SessionResponse, tags=["Sessions"])
async def create_session(payload: SessionCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new empty chat session."""
    session_obj = SessionModel(title=payload.title or "New Growth Conversation")
    db.add(session_obj)
    await db.commit()
    result = await db.execute(
        select(SessionModel)
        .options(selectinload(SessionModel.messages), selectinload(SessionModel.artifacts))
        .where(SessionModel.id == session_obj.id)
    )
    return result.scalars().first()

@app.get(f"{settings.API_PREFIX}/sessions/{{session_id}}", response_model=SessionResponse, tags=["Sessions"])
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves a specific chat session with messages and artifacts."""
    result = await db.execute(
        select(SessionModel)
        .options(selectinload(SessionModel.messages), selectinload(SessionModel.artifacts))
        .where(SessionModel.id == session_id)
    )
    session_obj = result.scalars().first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")
    return session_obj

@app.delete(f"{settings.API_PREFIX}/sessions/{{session_id}}", tags=["Sessions"])
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Deletes a chat session and associated messages/artifacts."""
    result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
    session_obj = result.scalars().first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.delete(session_obj)
    await db.commit()
    return {"message": "Session deleted successfully"}

# ----------------- Conversational Chat Endpoint ----------------- #

@app.post(f"{settings.API_PREFIX}/chat", response_model=ChatResponse, tags=["Chat"])
async def process_chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Main conversational endpoint:
    - Ingests user message
    - Executes hybrid RAG over Lenny's transcripts
    - Routes to active provider (Ollama, Claude, OpenAI, or Fallback)
    - Formats Ship 30 for 30 essays or Claude-style Artifacts when requested
    - Persists context & returns response with YouTube citations
    """
    try:
        response = await agent_router.process_chat(req, db)
        return response
    except Exception as e:
        logger.exception("Error processing chat: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating grounded response: {str(e)}"
        )

# ----------------- Artifact Endpoints ----------------- #

@app.get(f"{settings.API_PREFIX}/artifacts/{{artifact_id}}", response_model=ArtifactResponse, tags=["Artifacts"])
async def get_artifact(artifact_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves an artifact by ID."""
    result = await db.execute(select(ArtifactModel).where(ArtifactModel.id == artifact_id))
    artifact = result.scalars().first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return artifact
