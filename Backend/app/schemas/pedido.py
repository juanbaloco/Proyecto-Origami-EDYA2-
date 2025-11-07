from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Contacto(BaseModel):
    nombre: str
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None

class PedidoItem(BaseModel):
    producto_id: int
    cantidad: int

class PedidoCreate(BaseModel):
    contacto: Contacto
    items: List[PedidoItem]
    direccion: Optional[str] = None      # ✅ Nuevo campo
    metodo_pago: Optional[str] = None    # ✅ Nuevo campo

class PedidoResponse(BaseModel):
    id: str
    estado: str
    tipo: str
    total: Optional[float] = None
    descripcion: Optional[str] = None
    imagen_referencia: Optional[str] = None
    nombre_personalizado: Optional[str] = None
    precio_personalizado: Optional[float] = None
    comentario_vendedor: Optional[str] = None
    contacto: Contacto
    items: List[PedidoItem]
    direccion: Optional[str] = None       # ✅ Mostrar en respuesta
    metodo_pago: Optional[str] = None     # ✅ Mostrar en respuesta

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
    direccion: Optional[str] = None       # ✅ Incluir también aquí
    metodo_pago: Optional[str] = None     # ✅ Incluir también aquí

class GuestOrderCreate(BaseModel):
    contacto: Contacto
    items: List[PedidoItem]
    direccion: Optional[str] = None       # ✅ Soporte para invitados
    metodo_pago: Optional[str] = None     # ✅ Soporte para invitados

class GuestOrderResponse(BaseModel):
    message: str
    pedido_id: str
