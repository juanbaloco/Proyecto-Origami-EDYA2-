from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base

from sqlalchemy.orm import relationship

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    activo = Column(Boolean, default=True)


    # Relaciones con pedidos
    pedidos = relationship("Pedido", back_populates="usuario")