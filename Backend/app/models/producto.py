from sqlalchemy import Column, String, Float, Boolean, ForeignKey, Text, Integer
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
    activo = Column(Boolean, default=True, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    categoria_slug = Column(String, ForeignKey("Categoria.slug"), nullable=True)
    
    # Relaciones
    categoria = relationship("Categoria", back_populates="productos")
    items_carrito = relationship("ItemCarrito", back_populates="producto")
    items_pedido = relationship("PedidoItem", back_populates="producto")
