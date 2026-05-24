import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import HealthResponse

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Hello-Hedera-Pay API",
    description="AI-powered intelligence platform with on-chain HBAR tipping via Hedera HCS",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.on_event("startup")
async def _create_tables() -> None:
    from app.db.database import Base, engine
    import app.db.models  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        # --- Auto-migration for SQLite ---
        # create_all only creates tables that don't exist; it won't add new
        # columns to existing tables.  We ALTER TABLE to add any missing ones.
        _migrations = [
            ("facts", "agent_run_id", "VARCHAR(100)"),
            ("facts", "hcs_topic_id", "VARCHAR(100)"),
            ("tips", "fact_agent_run_id", "VARCHAR(100)"),
            ("tips", "fact_hcs_topic_id", "VARCHAR(100)"),
        ]
        for table, column, col_type in _migrations:
            try:
                await conn.exec_driver_sql(
                    f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"
                )
                logger.info("Migration: added %s.%s", table, column)
            except Exception:
                # Column already exists — safe to ignore
                pass

    logger.info("Database tables ready.")


from app.routers.analyze import router as analyze_router
app.include_router(analyze_router)

from app.routers.tip import router as tip_router
app.include_router(tip_router)

from app.routers.history import router as history_router
app.include_router(history_router)


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=False)
