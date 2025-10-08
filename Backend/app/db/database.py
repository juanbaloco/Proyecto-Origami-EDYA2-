# app/db/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "db", "BDproyectoorigami.db")


DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia de sesión (para usar en los endpoints)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
