from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    env: str = "dev"

    # JWT
    SECRET_KEY: str = "cambia_esta_clave_larga_y_unica_de_mas_de_32_caracteres"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"
        env_prefix = ""
        case_sensitive = False

settings = Settings()
