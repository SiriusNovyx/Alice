"""
Alice Transcript Service
A lightweight FastAPI microservice that renders Discord message archives
as browsable HTML pages. Runs alongside Alice in Docker.
"""

import uvicorn
from server import app

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=7500,
        reload=False,
        log_level="info",
    )
