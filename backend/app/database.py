import os
import sys
import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from backend.app.config import settings

# On Windows, psycopg async requires WindowsSelectorEventLoopPolicy
if sys.platform == "win32":
    import asyncio
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

logger = logging.getLogger("lenny_assistant.database")

Base = declarative_base()

# Resolve database URL
db_url = settings.DATABASE_URL
using_sqlite = False

if not db_url or "postgres" not in db_url:
    logger.info("No PostgreSQL DATABASE_URL found. Using local SQLite persistence.")
    db_url = settings.SQLITE_FALLBACK_URL
    using_sqlite = True
else:
    # Normalize postgresql:// to postgresql+psycopg_async://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg_async://", 1)
    elif db_url.startswith("postgresql://") and not (
        "postgresql+asyncpg://" in db_url or "postgresql+psycopg_async://" in db_url
    ):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg_async://", 1)

try:
    if using_sqlite:
        engine = create_async_engine(
            db_url,
            connect_args={"check_same_thread": False},
            echo=False
        )
    else:
        engine = create_async_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            echo=False
        )
    AsyncSessionLocal = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
except Exception as e:
    logger.warning(f"Failed to initialize engine for {db_url}: {e}. Falling back to SQLite.")
    engine = create_async_engine(
        settings.SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
    AsyncSessionLocal = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    using_sqlite = True

async def get_db():
    """Dependency that provides an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Initializes database schema tables."""
    from backend.app.models import SessionModel, MessageModel, ArtifactModel
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info(f"Database initialized successfully (Driver: {'SQLite' if using_sqlite else 'PostgreSQL/Supabase'}).")
