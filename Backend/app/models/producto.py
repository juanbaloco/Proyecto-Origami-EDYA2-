from sqlalchemy import Column, String, Float, Boolean, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.db.database import Base

class Producto(Base):
    __tablename__ = "Producto"


    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sku = Column(String, nullable=False, unique=True, index=True)
    nombre = Column(String(80), nullable=False)
    descripcion = Column(Text, nullable=True)
    slug = Column(String(60), nullable=False, index=True, unique=True)
    precio = Column(Float, nullable=False)
    color = Column(String, nullable=True)
    tamano = Column(String, nullable=True)
    material = Column(String, nullable=True)
    imagen_url = Column(String, nullable=True)  # string plano
    activo = Column(Boolean, default=True, nullable=False)
    categoria_slug = Column(String, ForeignKey("Categoria.slug"), nullable=True)

    # Relaciones
    categoria = relationship("Categoria", back_populates="productos")
    items_carrito = relationship("ItemCarrito", back_populates="producto")
    items_pedido = relationship("PedidoItem", back_populates="producto")