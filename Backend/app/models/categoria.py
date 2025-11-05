from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    descripcion = Column(String, nullable=True)
