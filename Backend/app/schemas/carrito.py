from pydantic import BaseModel

class ItemCarritoBase(BaseModel):
    producto_id: int
    cantidad: int

class ItemCarritoCreate(ItemCarritoBase):
    pass

class ItemCarritoUpdate(BaseModel):
    pass

class ItemCarritoResponse(ItemCarritoBase):
    session_id: str

    class Config:
        from_attribute = True