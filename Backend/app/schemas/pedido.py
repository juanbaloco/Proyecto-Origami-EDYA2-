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
