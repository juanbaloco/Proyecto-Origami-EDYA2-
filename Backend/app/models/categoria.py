from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.db.database import Base

class Categoria(Base):
    __tablename__ = "Categoria"
    
    slug = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    
    # Relación con productos
    productos = relationship("Producto", back_populates="categoria")