# app/api/routes/carrito.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.models.carrito import ItemCarrito
from app.schemas.carrito import ItemCarritoCreate, ItemCarritoResponse

router = APIRouter(prefix="/carrito", tags=["Carrito"])

@router.get("/", response_model=List[ItemCarritoResponse])
def ver_carrito(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ItemCarrito).filter(ItemCarrito.session_id == str(current_user.id)).all()

@router.post("/", response_model=ItemCarritoResponse, status_code=status.HTTP_201_CREATED)
def agregar_al_carrito(item: ItemCarritoCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    nuevo_item = ItemCarrito(**item.dict(), session_id=str(current_user.id))
    db.add(nuevo_item)
    db.commit()
    db.refresh(nuevo_item)
    return nuevo_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_item(item_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(ItemCarrito).filter(
        ItemCarrito.id == item_id,
        ItemCarrito.session_id == str(current_user.id)
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    db.delete(item)
    db.commit()
