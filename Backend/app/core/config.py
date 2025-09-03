from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    cors_origins: List[str] = ["http://localhost:5173"]
    env: str = "dev"

    class Config:
        env_file = ".env"
        env_prefix = ""
        case_sensitive = False

settings = Settings()
