from pydantic import BaseModel

class CategoriaBase(BaseModel):
    slug: str
    nombre: str

class CategoriaCreate(CategoriaBase):
    nombre: str

class CategoriaUpdate(BaseModel):
    class Config:
        from_attribute = True

class CategoriaResponse(CategoriaBase):
    id: int

    class Config:
        from_attribute = True