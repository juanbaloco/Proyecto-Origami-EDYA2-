# app/models/producto.py

from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base

class Producto(Base):
    __tablename__ = "productos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(80), nullable=False)
    descripcion = Column(String(500))
    precio = Column(Float, nullable=False)
    color = Column(String(50))
    tamano = Column(String(50))
    material = Column(String(100))
    imagen_url = Column(String(500))
    activo = Column(Boolean, default=True)
    stock = Column(Integer, default=0)
    categoria = Column(String(100))
    
    # ✅ Relaciones con strings
    pedido_items = relationship("PedidoItem", back_populates="producto")
    items_carrito = relationship("ItemCarrito", back_populates="producto")
