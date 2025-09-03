from fastapi import ApiRouter, HTTPException
from typing import List

router = APIRouter(prefix="/carrito", tags=["Carrito"])

carritos = {} #{session_id: [{"producto_id": 1, "cantidad": 2}]}

@router.get("/{session_id}")
def ver_carrito(session_id: str):
    return carritos.get(session_id, [])

@router.post("/{session_id}")
def agregar_carrito(session_id: str, item: dict):
    if session_id not in carritos:
        carritos[session_id] = []
    carritos[session_id].append(item)
    return {"msg": "agegado"}

@router.put("/{session_id}/{index}")
def actualizar_item(session_id: str, index: int, item: dict):
    if session_id in carritos and 0 <= index < len(carritos[session_id]):
        carritos[session_id][index] = item
        return {"msg": "Actualizado"}
    raise HTTPException(status_code=404, detail="Item no encontrado")

@router.delete("/{session_id}/{index}")
def eliminar_item(session_id: str, index: int):
    if session_id in carritos and 0 <= index < len(carritos[session_id]):
        carritos[session_id].pop(index)
        return {"msg": "Eliminado"}
    raise HTTPException(status_code=404, detail="Item no encontrado")