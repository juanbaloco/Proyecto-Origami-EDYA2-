from fastapi import APIRouter, HTTPException
from app.schemas.pedido import Pedido, PedidoCreate, PedidoPersonalizado
from typing import List

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


#db temporal
pedidos_db: List[Pedido] = []
id_counter = 1

@router.post("/", response_model=Pedido, status_code=201)
def crear_pedido(pedido: PedidoCreate):
    global id_counter
    new_pedido = Pedido(id=id_counter, estado ="pendiente", **pedido.dict())
    pedidos_db.append(new_pedido)
    id_counter += 1
    return new_pedido

@router.post("/personalizado", response_model=Pedido, status_code=201)
def crear_pedido_personalizado(pedido: PedidoPersonalizado):
    global id_counter
    new_pedido = Pedido(id=id_counter, estado ="soliciado", **pedido.dict())
    pedidos_db.append(new_pedido)
    id_counter += 1
    return new_pedido

@router.get("/", response_model= List[Pedido])
def listar_pedidos():
    return pedidos_db

@router.get("/{pedido_id}", response_model=Pedido)
def obtener_pedido(pedido_id: int):
    for p in pedidos_db:
        if p.id == pedido_id:
            return p
    raise HTTPException(status_code=404, detail="Pedido no encontrado")

@router.put("/{pedido_id}/estado", response_model=Pedido)
def actualizar_estado_pedido(pedido_id: int, estado: str):
    for p in pedidos_db:
        if p.id == pedido_id:
            p.estado = estado
            return p
    raise HTTPException(status_code=404, detail="Pedido no encontrado")

@router.delete("/{pedido_id}", status_code=204)
def cancelar_pedido(pedido_id: int):
    for i, p in enumerate(pedidos_db):
        if p.id == pedido_id:
            if p.estado == "despachado":
                raise HTTPException(status_code=409, detail ="No se puede cancelar un pedido despachado")
            pedidos_db.pop(i)
            return
    raise HTTPException(status_code=404, detail="Pedido no encontrado")