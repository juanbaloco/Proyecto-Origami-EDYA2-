from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.database import Base


class Pedido(Base):
    __tablename__ = "Pedido"
    
    id = Column(String, primary_key=True)
    estado = Column(String, nullable=False, default="pendiente")
    contacto_nombre = Column(String, nullable=False)
    contacto_email = Column(String, nullable=False)
    contacto_telefono = Column(String, nullable=True)
    tipo = Column(String, nullable=False, default="estandar")
    descripcion = Column(Text, nullable=True)
    imagen_referencia = Column(String, nullable=True)
    
    # ✅ NUEVOS CAMPOS - Agregar al final
    nombre_personalizado = Column(String(200), nullable=True)
    precio_personalizado = Column(Float, nullable=True)
    comentario_vendedor = Column(Text, nullable=True)
    
    items = relationship("PedidoItem", back_populates="pedido", cascade="all, delete-orphan")


class PedidoItem(Base):
    __tablename__ = "PedidoItem"
    
    pedido_id = Column(String, ForeignKey("Pedido.id"), primary_key=True)
    producto_id = Column(Integer, ForeignKey("Producto.id"), primary_key=True, index=True)
    cantidad = Column(Integer, nullable=False)
    
    pedido = relationship("Pedido", back_populates="items")
    producto = relationship("Producto", back_populates="items_pedido")
