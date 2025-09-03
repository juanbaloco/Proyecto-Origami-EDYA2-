from pydantic import BaseModel, Field, HttpUrl
from typing import Optional

SKU_PATTERN = r"^[A-Z]{3}-\d{3}$"  # AAA-999

class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=80)
    descripcion: Optional[str] = None
    precio: float = Field(..., gt=0)
    color: Optional[str] = None
    tamano: Optional[str] = None
    material: Optional[str] = None
    imagen_url: Optional[HttpUrl] = None
    activo: bool = True

class ProductoCreate(ProductoBase):
    sku: str = Field(..., pattern=SKU_PATTERN)
    slug: str = Field(..., min_length=3, max_length=60)
    categoria_slug: Optional[str] = Field(default=None, description="3d|filigrama|pliegues|ensambles")

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=80)
    descripcion: Optional[str] = None
    precio: Optional[float] = Field(None, gt=0)
    color: Optional[str] = None
    tamano: Optional[str] = None
    material: Optional[str] = None
    imagen_url: Optional[HttpUrl] = None
    activo: Optional[bool] = None
    sku: Optional[str] = Field(None, pattern=SKU_PATTERN)
    slug: Optional[str] = Field(None, min_length=3, max_length=60)
    categoria_slug: Optional[str] = Field(default=None, description="3d|filigrama|pliegues|ensambles")

class ProductoOut(ProductoBase):
    id: str
    sku: str
    slug: str
    categoria_slug: Optional[str] = None
