from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.transcripts import router as transcripts_router

app = FastAPI(title="Alice Transcript Service", version="1.0.0", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(transcripts_router)
