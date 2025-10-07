from pydantic import BaseModel

class CategoriaBase(BaseModel):
    slug: str
    nombre: str

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    class Config:
        orm_mode = True