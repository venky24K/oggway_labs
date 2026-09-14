from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class CitationItem(BaseModel):
    chunk_id: Optional[str] = None
    guest: str
    title: str
    timestamp: str
    start_seconds: int = 0
    youtube_url: str
    snippet: str
    score: Optional[float] = None

class ArtifactBase(BaseModel):
    title: str
    artifact_type: str = "markdown"  # "markdown" or "html"
    content: str

class ArtifactCreate(ArtifactBase):
    session_id: str
    message_id: Optional[str] = None

class ArtifactResponse(ArtifactBase):
    id: str
    session_id: str
    message_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MessageBase(BaseModel):
    role: str
    content: str

class MessageCreate(MessageBase):
    citations: Optional[List[CitationItem]] = []
    model_used: Optional[str] = "ollama"

class MessageResponse(MessageBase):
    id: str
    session_id: str
    citations_json: Optional[List[Dict[str, Any]]] = []
    model_used: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SessionCreate(BaseModel):
    title: Optional[str] = "New Growth Conversation"

class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    metadata_json: Optional[Dict[str, Any]] = {}
    messages: Optional[List[MessageResponse]] = []
    artifacts: Optional[List[ArtifactResponse]] = []
    model_config = ConfigDict(from_attributes=True)

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    provider: Optional[str] = None  # "ollama", "anthropic", "openai", "fallback"
    model: Optional[str] = None
    generate_ship30: Optional[bool] = False
    generate_artifact: Optional[bool] = False
    artifact_type: Optional[str] = "html"  # "html" or "markdown"

class ChatResponse(BaseModel):
    session_id: str
    message: str
    citations: List[CitationItem] = []
    artifact: Optional[ArtifactResponse] = None
    model_used: str
    provider: str
    grounded: bool = True

class ModelStatusResponse(BaseModel):
    ollama_available: bool
    ollama_models: List[str] = []
    current_provider: str
    current_model: Optional[str] = None
    available_providers: List[str] = []
    database_connected: bool
    database_type: str
    indexed_episodes: int
    indexed_chunks: int
