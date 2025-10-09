from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_db, get_current_user, require_admin
from app.models.pedido import Pedido
from app.schemas.pedido import (
    PedidoCreate,
    PedidoPersonalizado,
    PedidoResponse,
    PedidoUpdateEstado,
)

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

@router.post("/", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    pedido: PedidoCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    nuevo = Pedido(**pedido.dict(), contacto_email=current_user.email, estado="pendiente")
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.post("/personalizado", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido_personalizado(
    pedido: PedidoPersonalizado,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    nuevo = Pedido(**pedido.dict(), contacto_email=current_user.email, estado="solicitado")
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.get("/mis-pedidos", response_model=List[PedidoResponse])
def get_mis_pedidos(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Pedido).filter(Pedido.contacto_email == current_user.email).all()

@router.get("/", response_model=List[PedidoResponse], dependencies=[Depends(require_admin)])
def get_todos_pedidos(db: Session = Depends(get_db)):
    return db.query(Pedido).all()

@router.put("/{pedido_id}/estado", response_model=PedidoResponse, dependencies=[Depends(require_admin)])
def actualizar_estado_pedido(
    pedido_id: int,
    estado_update: PedidoUpdateEstado,
    db: Session = Depends(get_db),
):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido.estado = estado_update.estado
    db.commit()
    db.refresh(pedido)
    return pedido

@router.delete("/{pedido_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_pedido(
    pedido_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pedido = db.query(Pedido).filter(
        Pedido.id == pedido_id,
        Pedido.contacto_email == current_user.email
    ).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if pedido.estado == "despachado":
        raise HTTPException(status_code=409, detail="No se puede cancelar un pedido despachado")
    db.delete(pedido)
    db.commit()
    return None
