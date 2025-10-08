from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Carrito(Base):
    __tablename__ = "Carrito"
    
    session_id = Column(String, primary_key=True)
    
    # Relación con items del carrito
    items = relationship("ItemCarrito", back_populates="carrito", cascade="all, delete-orphan")


class ItemCarrito(Base):
    __tablename__ = "ItemCarrito"
    
    session_id = Column(String, ForeignKey("Carrito.session_id"), primary_key=True)
    producto_id = Column(String, ForeignKey("Producto.id"), primary_key=True, index=True)
    cantidad = Column(Integer, nullable=False)
    
    # Relaciones
    carrito = relationship("Carrito", back_populates="items")
    producto = relationship("Producto", back_populates="items_carrito")