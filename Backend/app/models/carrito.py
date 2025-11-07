# app/models/carrito.py

from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Carrito(Base):
    __tablename__ = "carritos"
    
    session_id = Column(String, primary_key=True)
    
    # ✅ Relación con items
    items = relationship("ItemCarrito", back_populates="carrito", cascade="all, delete-orphan")


class ItemCarrito(Base):
    __tablename__ = "carrito_items"
    
    session_id = Column(String, ForeignKey("carritos.session_id"), primary_key=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), primary_key=True, index=True)
    cantidad = Column(Integer, nullable=False)
    
    # ✅ Relaciones con strings
    carrito = relationship("Carrito", back_populates="items")
    producto = relationship("Producto", back_populates="items_carrito")
