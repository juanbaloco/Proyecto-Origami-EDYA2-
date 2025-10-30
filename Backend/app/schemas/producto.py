from pydantic import BaseModel, Field
from typing import Optional

class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=80)
    descripcion: Optional[str] = None
    precio: float = Field(..., gt=0)
    color: Optional[str] = None
    tamano: Optional[str] = None
    material: Optional[str] = None
    imagen_url: Optional[str] = None
    activo: bool = True
    stock: int = Field(ge=0, default=0)
    categoria_slug: Optional[str] = Field(default=None, description="3d|filigrama|pliegues|ensambles")

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=80)
    descripcion: Optional[str] = None
    precio: Optional[float] = Field(None, gt=0)
    color: Optional[str] = None
    tamano: Optional[str] = None
    material: Optional[str] = None
    imagen_url: Optional[str] = None
    activo: Optional[bool] = None
    stock: Optional[int] = Field(default=None, ge=0)
    categoria_slug: Optional[str] = Field(default=None, description="3d|filigrama|pliegues|ensambles")

class ProductoOut(ProductoBase):
    id: int
    
    class Config:
        from_attributes = True
