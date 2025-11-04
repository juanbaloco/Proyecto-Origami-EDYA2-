from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional

class Contacto(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None

class PedidoItem(BaseModel):
    producto_id: int
    cantidad: int

class PedidoCreate(BaseModel):
    contacto: Contacto
    items: List[PedidoItem]

class PedidoPersonalizado(BaseModel):
    contacto: Contacto
    descripcion: str
    imagen_referencia: Optional[str] = None

class PedidoUpdateEstado(BaseModel):
    estado: str

class PedidoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    estado: str
    contacto: Contacto
    items: List[PedidoItem]
    tipo: str
    descripcion: Optional[str] = None
    imagen_referencia: Optional[str] = None

# ✅ NUEVO: Schema para información de invitado
class GuestInfo(BaseModel):
    nombreCompleto: str
    email: EmailStr
    whatsapp: str
    direccion: str
    metodoPago: str  # "transferencia", "efectivo", "tarjeta"

# ✅ NUEVO: Item simple para pedidos de invitados
class GuestOrderItem(BaseModel):
    producto_id: int
    nombre: str
    precio: float
    cantidad: int

# ✅ NUEVO: Request completo para pedidos de invitados
class GuestOrderCreate(BaseModel):
    guestInfo: GuestInfo
    items: List[GuestOrderItem]
    total: float

# ✅ NUEVO: Response para pedidos de invitados
class GuestOrderResponse(BaseModel):
    status: str
    order_id: str
    message: str