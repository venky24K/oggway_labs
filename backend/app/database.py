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

# Always maintain an initialized SQLite fallback engine
sqlite_engine = create_async_engine(
    settings.SQLITE_FALLBACK_URL,
    connect_args={"check_same_thread": False},
    echo=False
)
SqliteSessionLocal = async_sessionmaker(
    bind=sqlite_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    """Dependency providing database session with automatic SQLite fallback."""
    global using_sqlite
    if using_sqlite:
        async with SqliteSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()
    else:
        try:
            async with AsyncSessionLocal() as session:
                try:
                    yield session
                finally:
                    await session.close()
        except Exception as e:
            logger.warning(f"PostgreSQL connection error: {e}. Falling back to SQLite.")
            async with SqliteSessionLocal() as session:
                try:
                    yield session
                finally:
                    await session.close()

async def init_db():
    """Initializes tables in both Supabase PostgreSQL (if reachable) and SQLite."""
    global engine, AsyncSessionLocal, using_sqlite
    from backend.app.models import SessionModel, MessageModel, ArtifactModel

    # 1. Always ensure local SQLite tables are initialized
    try:
        async with sqlite_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        logger.warning(f"Error initializing SQLite fallback: {e}")

    # 2. If PostgreSQL is configured, initialize it
    if not using_sqlite:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database initialized successfully (Driver: PostgreSQL/Supabase).")
        except Exception as e:
            logger.warning(f"Could not reach PostgreSQL on current network ({e}). Switched to local SQLite persistence.")
            using_sqlite = True
            engine = sqlite_engine
            AsyncSessionLocal = SqliteSessionLocal

async def reinit_database(new_url: str = None) -> bool:
    """Dynamically reconfigures and tests database connection when settings change."""
    global db_url, engine, AsyncSessionLocal, using_sqlite
    from backend.app.models import SessionModel, MessageModel, ArtifactModel

    target_url = new_url or settings.DATABASE_URL
    if not target_url or "postgres" not in target_url:
        logger.info("Switching to SQLite persistence.")
        db_url = settings.SQLITE_FALLBACK_URL
        using_sqlite = True
        engine = sqlite_engine
        AsyncSessionLocal = SqliteSessionLocal
        return True

    # Normalize postgresql:// to postgresql+psycopg_async://
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql+psycopg_async://", 1)
    elif target_url.startswith("postgresql://") and not (
        "postgresql+asyncpg://" in target_url or "postgresql+psycopg_async://" in target_url
    ):
        target_url = target_url.replace("postgresql://", "postgresql+psycopg_async://", 1)

    try:
        new_engine = create_async_engine(
            target_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            echo=False
        )
        async with new_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        engine = new_engine
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        db_url = target_url
        using_sqlite = False
        logger.info("Successfully reconnected to updated PostgreSQL database.")
        return True
    except Exception as e:
        logger.warning(f"Failed to connect to database {target_url}: {e}. Retaining SQLite fallback.")
        using_sqlite = True
        engine = sqlite_engine
        AsyncSessionLocal = SqliteSessionLocal
        return False
