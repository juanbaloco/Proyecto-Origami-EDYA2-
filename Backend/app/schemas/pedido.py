from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Contacto(BaseModel):
    nombre: str
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None

# ✅ Schema para CREAR pedido (sin nombre ni precio ni imagen)
class PedidoItemCreate(BaseModel):
    producto_id: int
    cantidad: int

# ✅ Schema para RESPUESTA (con nombre, precio e imagen)
class PedidoItem(BaseModel):
    producto_id: int
    nombre: str
    cantidad: int
    precio: float
    imagen_url: Optional[str] = None  # ✅ AGREGADO

class PedidoCreate(BaseModel):
    contacto: Contacto
    items: List[PedidoItemCreate]
    direccion: Optional[str] = None
    metodo_pago: Optional[str] = None

class PedidoResponse(BaseModel):
    pedido_id: str
    estado: str
    tipo: str
    total: Optional[float] = None
    descripcion: Optional[str] = None
    imagen_referencia: Optional[str] = None
    nombre_personalizado: Optional[str] = None
    precio_personalizado: Optional[float] = None
    comentario_vendedor: Optional[str] = None
    comentario_cancelacion: Optional[str] = None
    contacto: Contacto
    items: List[PedidoItem]
    direccion: Optional[str] = None
    metodo_pago: Optional[str] = None

    class Config:
        from_attributes = True

class PedidoUpdateEstado(BaseModel):
    estado: str
    comentario_vendedor: Optional[str] = None

class PedidoPersonalizado(BaseModel):
    nombre_personalizado: str
    descripcion: str
    imagen_referencia: Optional[str] = None
    contacto: Contacto
    direccion: Optional[str] = None
    metodo_pago: Optional[str] = None

class GuestOrderCreate(BaseModel):
    contacto: Contacto
    items: List[PedidoItemCreate]
    direccion: Optional[str] = None
    metodo_pago: Optional[str] = None

class GuestOrderResponse(BaseModel):
    message: str
    pedido_id: str