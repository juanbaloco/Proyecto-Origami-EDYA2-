from pydantic import BaseModel, EmailStr
from typing import List, Optional


class Fidelizacion(BaseModel):
    id: int
    correo : EmailStr
    nombre_completo : str
    fecha_nacimiento :str
    redes: Optional[List[str]] = None
    direccion: Optional[str] = None

class FidelizacionBase(BaseModel):
    correo : EmailStr
    nombre_completo : str
    fecha_nacimiento :str
    redes: Optional[List[str]] = None
    direccion: Optional[str] = None

class FidelizacionCreate(FidelizacionBase):
    pass

class FidelizacionUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    redes: Optional[List[str]] = None
    direccion: Optional[str] = None

class FidelizacionResponse(FidelizacionBase):
    id: int
    puntos: int = 0
    tutoriales: List[str] = []
    proximo_regalo: Optional[str] = None

    class Config:
        from_attributes = True