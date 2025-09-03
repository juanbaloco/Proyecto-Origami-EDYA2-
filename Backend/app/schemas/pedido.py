from pydantic import BaseModel, EmailStr
from typing import List, Optional


class Contacto(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None

class PedidoItem(BaseModel):
    producto_id: str
    cantidad: int    

class PedidoBase(BaseModel):
    contacto: Contacto
    
class PedidoCreate(PedidoBase):
    items: List[PedidoItem]
    
class PedidoPersonalizado(PedidoBase):
    descripcion: str
    imagen_referencia: Optional[str] = None

class Pedido(PedidoCreate):
    id: int
    estado: str