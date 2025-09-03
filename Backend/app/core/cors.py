from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings

def setup_cors(app):
    originis = [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
