from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_db, get_current_user
from app.models.carrito import ItemCarrito
from app.schemas.carrito import ItemCarritoCreate, ItemCarritoResponse

router = APIRouter(prefix="/carrito", tags=["Carrito"])

@router.post("/", response_model=List[ItemCarritoResponse])
def ver_carrito(current_user= Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(ItemCarrito).filter(ItemCarrito.session_id == str(current_user.id)).all()
    return items


@router.post("/", response_model=ItemCarritoResponse)
def agregar_al_carrito(item: ItemCarritoCreate, current_user= Depends(get_current_user), db: Session = Depends(get_db)):
    nuevo_item = ItemCarrito(**item.dict(), session_id=str(current_user.id))
    db.add(nuevo_item)
    db.commit()
    db.refresh(nuevo_item)
    return nuevo_item

#@router.put("/{session_id}/{index}")
#def actualizar_item(session_id: str, index: int, item: dict):
 #   if session_id in carritos and 0 <= index < len(carritos[session_id]):
  #      carritos[session_id][index] = item
   #     return {"msg": "Actualizado"}
    #raise HTTPException(status_code=404, detail="Item no encontrado")

@router.delete("/{item_id}", status_code=204)
def eliminar_item(item_id: int, current_user =Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(ItemCarrito).filter(ItemCarrito.id == item_id, ItemCarrito.session_id == str(current_user.id)).first()
    if not item:
     raise HTTPException(status_code=404, detail="Item no encontrado")
    db.delete(item)
    db.commit()
    return