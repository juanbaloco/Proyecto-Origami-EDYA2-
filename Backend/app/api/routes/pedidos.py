# app/api/routes/pedidos.py

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import uuid

# ✅ Imports correctos de dependencias
from app.core.dependencies import get_db, require_admin, get_current_user

# ✅ Imports de modelos de base de datos
from app.models.pedido import Pedido, PedidoItem

# ✅ Imports de schemas (Pydantic)
from app.schemas.pedido import (
    PedidoCreate, 
    PedidoResponse,  # ✅ Este es el correcto
    PedidoPersonalizado,
    PedidoUpdateEstado,
    GuestOrderCreate,
    GuestOrderResponse
)


router = APIRouter(prefix="/api/pedidos", tags=["pedidos"])


# ✅ Schema para actualizar pedido personalizado
class ActualizarPedidoPersonalizadoRequest(BaseModel):
    nombre_personalizado: Optional[str] = None
    precio_personalizado: Optional[float] = None
    comentario_vendedor: Optional[str] = None


# ✅ 1. Endpoint para obtener pedidos normales (estandar)
@router.get("/normales", dependencies=[Depends(require_admin)])
def obtener_pedidos_normales(db: Session = Depends(get_db)):
    """Obtener todos los pedidos normales/estándar (solo admin)"""
    pedidos = db.query(Pedido).filter(Pedido.tipo == "estandar").all()
    return pedidos


# ✅ 2. Endpoint para obtener pedidos personalizados
@router.get("/personalizados", dependencies=[Depends(require_admin)])
def obtener_pedidos_personalizados(db: Session = Depends(get_db)):
    """Obtener todos los pedidos personalizados (solo admin)"""
    pedidos = db.query(Pedido).filter(Pedido.tipo == "personalizado").all()
    return pedidos


# ✅ 3. Endpoint para actualizar pedido personalizado (nombre, precio, comentario)
@router.patch("/{pedido_id}/personalizado", dependencies=[Depends(require_admin)])
def actualizar_pedido_personalizado(
    pedido_id: str,
    data: ActualizarPedidoPersonalizadoRequest,
    db: Session = Depends(get_db)
):
    """Actualizar campos personalizados de un pedido (solo admin)"""
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    if data.nombre_personalizado is not None:
        pedido.nombre_personalizado = data.nombre_personalizado
    if data.precio_personalizado is not None:
        pedido.precio_personalizado = data.precio_personalizado
    if data.comentario_vendedor is not None:
        pedido.comentario_vendedor = data.comentario_vendedor
    
    db.commit()
    db.refresh(pedido)
    
    return pedido


# ✅ 4. Endpoint para actualizar estado de pedido
@router.put("/{pedido_id}/estado", dependencies=[Depends(require_admin)])
def actualizar_estado_pedido(
    pedido_id: str,
    estado_data: PedidoUpdateEstado,
    db: Session = Depends(get_db)
):
    """Actualizar estado de un pedido (solo admin)"""
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    pedido.estado = estado_data.estado
    db.commit()
    db.refresh(pedido)
    return pedido


# ✅ 5. Endpoint para crear pedido de invitado (guest)
@router.post("/guest", response_model=GuestOrderResponse)
def crear_pedido_invitado(order: GuestOrderCreate, db: Session = Depends(get_db)):
    """
    Crear pedido sin autenticación (usuario invitado).
    Guarda información del cliente y productos solicitados.
    """
    try:
        pedido_id = f"GUEST-{uuid.uuid4().hex[:8].upper()}"
        
        nuevo_pedido = Pedido(
            id=pedido_id,
            tipo="estandar",
            estado="pendiente",
            total=order.total,
            contacto_nombre=order.guestInfo.nombreCompleto,
            contacto_email=order.guestInfo.email,
            contacto_telefono=order.guestInfo.whatsapp,
            descripcion=f"Método de pago: {order.guestInfo.metodoPago} | Dirección: {order.guestInfo.direccion}"
        )
        
        db.add(nuevo_pedido)
        db.flush()
        
        for item in order.items:
            pedido_item = PedidoItem(
                pedido_id=pedido_id,
                producto_id=item.producto_id,
                cantidad=item.cantidad
            )
            db.add(pedido_item)
        
        db.commit()
        
        return GuestOrderResponse(
            status="success",
            order_id=pedido_id,
            message="Pedido creado exitosamente. Te contactaremos pronto."
        )
    
    except Exception as e:
        db.rollback()
        print(f"❌ Error creando pedido de invitado: {e}")
        raise HTTPException(status_code=500, detail=f"Error creando pedido: {str(e)}")


# ✅ 6. Endpoint para obtener todos los pedidos (admin)
@router.get("/", dependencies=[Depends(require_admin)])
def obtener_todos_pedidos(db: Session = Depends(get_db)):
    """Obtener todos los pedidos (solo admin)"""
    pedidos = db.query(Pedido).all()
    return pedidos


# ✅ 7. Endpoint para crear pedido personalizado
@router.post("/personalizado")
def crear_pedido_personalizado(pedido: PedidoPersonalizado, db: Session = Depends(get_db)):
    """
    Crear un pedido personalizado.
    No requiere autenticación.
    """
    try:
        pedido_id = f"CUSTOM-{uuid.uuid4().hex[:8].upper()}"
        
        nuevo_pedido = Pedido(
            id=pedido_id,
            tipo="personalizado",
            estado="pendiente",
            descripcion=pedido.descripcion,
            imagen_referencia=pedido.imagen_referencia,
            contacto_nombre=pedido.contacto.nombre,
            contacto_email=pedido.contacto.email,
            contacto_telefono=pedido.contacto.telefono
        )
        
        db.add(nuevo_pedido)
        db.commit()
        db.refresh(nuevo_pedido)
        
        return {"status": "success", "pedido_id": pedido_id, "message": "Pedido personalizado creado"}
    
    except Exception as e:
        db.rollback()
        print(f"❌ Error creando pedido personalizado: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ✅ 8. Endpoint para obtener pedidos del usuario autenticado
@router.get("/mis-pedidos", response_model=List[PedidoResponse])  # ✅ Corregido aquí
def obtener_mis_pedidos(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Obtener pedidos del usuario autenticado"""
    pedidos_db = db.query(Pedido).filter(
        Pedido.contacto_email == current_user.email
    ).all()

    # Transformar el resultado a la estructura esperada
    pedidos = []
    for p in pedidos_db:
        pedido = {
            "id": p.id,
            "estado": p.estado,
            "contacto": {
                "nombre": p.contacto_nombre,
                "email": p.contacto_email,
                "telefono": p.contacto_telefono
            },
            "items": [],  # ✅ Si tienes items relacionados, transforma aquí
            "tipo": p.tipo,
            "descripcion": p.descripcion,
            "imagen_referencia": p.imagen_referencia
        }
        pedidos.append(pedido)
    
    return pedidos
