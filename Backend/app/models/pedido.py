from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Pedido(Base):
    __tablename__ = "Pedido"
    
    id = Column(String, primary_key=True)  # UniqueID
    estado = Column(String, nullable=False, default="pendiente")
    contacto_nombre = Column(String, nullable=False)
    contacto_email = Column(String, nullable=False)
    contacto_telefono = Column(String, nullable=True)
    
    # Relación con items del pedido
    items = relationship("PedidoItem", back_populates="pedido", cascade="all, delete-orphan")


class PedidoItem(Base):
    __tablename__ = "PedidoItem"
    
    pedido_id = Column(String, ForeignKey("Pedido.id"), primary_key=True)
    producto_id = Column(String, ForeignKey("Producto.id"), primary_key=True, index=True)
    cantidad = Column(Integer, nullable=False)
    
    # Relaciones
    pedido = relationship("Pedido", back_populates="items")
    producto = relationship("Producto", back_populates="items_pedido")