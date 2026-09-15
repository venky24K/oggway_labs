import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # App Info
    APP_NAME: str = "LennyOS"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Persistence: Supabase / PostgreSQL or SQLite Fallback
    # Example Supabase: postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
    DATABASE_URL: Optional[str] = None
    SQLITE_FALLBACK_URL: str = "sqlite+aiosqlite:///./data/lenny_assistant.db"

    # LLM Provider Configuration
    DEFAULT_PROVIDER: str = "ollama"  # "ollama", "anthropic", "openai", "fallback"
    
    # Ollama Local LLM
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"  # or mistral, qwen2.5, phi3
    
    # Cloud LLMs
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"
    
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_BASE_URL: Optional[str] = None  # allows Groq, Together, DeepSeek, etc.

    # Google Gemini
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"  # or gemini-3.1-pro, gemini-3.6-flash

    # Knowledge Base Path
    INDEX_PATH: str = "data/transcripts_index.json"
    
    # Security & CORS
    CORS_ORIGINS: list[str] = ["*"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="allow"
    )

settings = Settings()
