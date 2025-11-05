from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

class Producto(Base):
    __tablename__ = "Producto"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(80), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Float, nullable=False)
    color = Column(String, nullable=True)
    tamano = Column(String, nullable=True)
    material = Column(String, nullable=True)
    imagen_url = Column(String, nullable=True)
    activo = Column(Boolean, default=True)
    stock = Column(Integer, default=0)
    categoria = Column(String, nullable=True)
    
    # ✅ Relaciones requeridas por back_populates en otros modelos
    items_carrito = relationship("ItemCarrito", back_populates="producto")
    items_pedido = relationship("PedidoItem", back_populates="producto")
