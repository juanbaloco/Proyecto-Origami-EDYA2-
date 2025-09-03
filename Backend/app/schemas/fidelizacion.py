from pydantic import BaseModel, EmailStr
from typing import List, Optional

class FidelizacionCreate(BaseModel):
    correo : EmailStr
    nombre_completo : str
    fecha_nacimiento :str
    redes: Optional[List[str]] = None
    direccion: Optional[str] = None

class Fidelizacion(FidelizacionCreate):
    id: int
    puntos: int = 0
    tutoriales: List[str] = []
    proximo_regalo: Optional[str] = None