from pydantic import BaseModel
from typing import Optional

class CategoriaBase(BaseModel):
    nombre: str
    slug: str
    descripcion: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    slug: Optional[str] = None
    descripcion: Optional[str] = None
    
    class Config:
        from_attributes = True

class CategoriaResponse(CategoriaBase):
    id: int
    
    class Config:
        from_attributes = True
