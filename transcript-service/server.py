import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.transcripts import cleanup_expired_transcripts, router as transcripts_router

logger = logging.getLogger("transcript-service")

_CLEANUP_INTERVAL_SECONDS = 15 * 60  # ~15 minutes


async def _expiry_cleanup_loop() -> None:
    while True:
        try:
            removed = await asyncio.to_thread(cleanup_expired_transcripts)
            if removed:
                logger.info("Expired transcript cleanup removed %s file(s)", removed)
        except Exception:
            logger.exception("Expired transcript cleanup failed")
        await asyncio.sleep(_CLEANUP_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_expiry_cleanup_loop())
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="Alice Transcript Service",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(transcripts_router)
