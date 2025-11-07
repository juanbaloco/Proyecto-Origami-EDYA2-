# app/models/pedido.py

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Pedido(Base):
    __tablename__ = "pedidos"
    
    # ✅ ID como String para soportar UUID y formatos como "GUEST-XXX" y "CUSTOM-XXX"
    id = Column(String(100), primary_key=True, index=True)
    
    # ✅ Usuario (opcional para invitados)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    # ✅ Información básica del pedido
    total = Column(Float, nullable=False, default=0.0)
    estado = Column(String(50), default="pendiente")
    tipo = Column(String(50), default="estandar")  # "estandar" o "personalizado"
    
    # ✅ Datos de contacto
    contacto_nombre = Column(String(200), nullable=False)
    contacto_email = Column(String(200), nullable=False)
    contacto_telefono = Column(String(50), nullable=True)
    
    # ✅ Dirección y método de pago
    direccion = Column(String(500), nullable=True)
    metodo_pago = Column(String(50), nullable=True)
    
    # ✅ Campos para pedidos personalizados
    descripcion = Column(Text, nullable=True)
    imagen_referencia = Column(String(500), nullable=True)
    nombre_personalizado = Column(String(200), nullable=True)
    precio_personalizado = Column(Float, nullable=True)
    
    # ✅ Comentarios (admin/vendedor)
    comentario_vendedor = Column(Text, nullable=True)  # ✅ AÑADIR ESTA LÍNEA
    comentario_cancelacion = Column(Text, nullable=True)  # Ya está
    
    # ✅ Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # ✅ Relaciones
    usuario = relationship("Usuario", back_populates="pedidos")
    items = relationship("PedidoItem", back_populates="pedido", cascade="all, delete-orphan")


class PedidoItem(Base):
    __tablename__ = "pedido_items"
    
    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(String(100), ForeignKey("pedidos.id"), nullable=False)  # ✅ String para coincidir con Pedido.id
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Float, nullable=False, default=0.0)  # ✅ Agregado default
    
    # ✅ Relaciones
    pedido = relationship("Pedido", back_populates="items")
    producto = relationship("Producto", back_populates="pedido_items")
