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
    logger.info("Database tables ready.")


try:
    from app.routers.analyze import router as analyze_router
    app.include_router(analyze_router)
except ImportError:
    logger.warning("analyze router not yet available")

try:
    from app.routers.tip import router as tip_router
    app.include_router(tip_router)
except ImportError:
    logger.warning("tip router not yet available")

try:
    from app.routers.history import router as history_router
    app.include_router(history_router)
except ImportError:
    logger.warning("history router not yet available")


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=False)
