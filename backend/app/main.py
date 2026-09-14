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
from backend.app.database import get_db, init_db, using_sqlite
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
    if settings.ANTHROPIC_API_KEY:
        available.append("anthropic")
    if settings.OPENAI_API_KEY:
        available.append("openai")

    return ModelStatusResponse(
        ollama_available=ollama_ok,
        ollama_models=ollama_models,
        current_provider=settings.DEFAULT_PROVIDER,
        available_providers=available,
        database_connected=True,
        database_type="sqlite" if using_sqlite else "postgresql",
        indexed_episodes=len(retriever.catalog),
        indexed_chunks=len(retriever.chunks)
    )

from pydantic import BaseModel

class SettingsUpdatePayload(BaseModel):
    provider: Optional[str] = None
    ollama_url: Optional[str] = None
    ollama_model: Optional[str] = None
    openai_key: Optional[str] = None
    openai_model: Optional[str] = None
    openai_base_url: Optional[str] = None
    anthropic_key: Optional[str] = None
    anthropic_model: Optional[str] = None
    database_url: Optional[str] = None

@app.post(f"{settings.API_PREFIX}/settings", tags=["System"])
async def update_settings(payload: SettingsUpdatePayload):
    """Updates runtime configuration in memory."""
    if payload.provider:
        settings.DEFAULT_PROVIDER = payload.provider
    if payload.ollama_url:
        settings.OLLAMA_BASE_URL = payload.ollama_url
    if payload.ollama_model:
        settings.OLLAMA_MODEL = payload.ollama_model
    if payload.openai_key is not None:
        settings.OPENAI_API_KEY = payload.openai_key
    if payload.openai_model:
        settings.OPENAI_MODEL = payload.openai_model
    if payload.openai_base_url is not None:
        settings.OPENAI_BASE_URL = payload.openai_base_url if payload.openai_base_url.strip() else None
    if payload.anthropic_key is not None:
        settings.ANTHROPIC_API_KEY = payload.anthropic_key
    if payload.anthropic_model:
        settings.ANTHROPIC_MODEL = payload.anthropic_model
    if payload.database_url:
        settings.DATABASE_URL = payload.database_url

    return {"status": "success", "current_provider": settings.DEFAULT_PROVIDER}

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
