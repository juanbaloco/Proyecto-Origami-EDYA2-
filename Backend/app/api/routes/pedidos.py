from uuid import uuid4
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user, require_admin
from app.models.pedido import Pedido, PedidoItem as PedidoItemModel
from app.models.producto import Producto
from app.schemas.pedido import (
    PedidoCreate, PedidoPersonalizado, PedidoResponse, PedidoUpdateEstado,
    PedidoItem, Contacto, GuestOrderCreate, GuestOrderResponse 
)

router = APIRouter(prefix="/api/pedidos", tags=["pedidos"])

def to_response(p: Pedido) -> PedidoResponse:
    return PedidoResponse(
        id=p.id, estado=p.estado, tipo=p.tipo,
        descripcion=p.descripcion, imagen_referencia=p.imagen_referencia,
        contacto=Contacto(
            nombre=p.contacto_nombre,
            email=p.contacto_email,
            telefono=p.contacto_telefono
        ),
        items=[PedidoItem(producto_id=it.producto_id, cantidad=it.cantidad) for it in p.items]
    )

@router.post("/", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido(pedido: PedidoCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not pedido.items:
        raise HTTPException(status_code=422, detail="El pedido debe tener items")
    
    # Validar y descontar stock
    for it in pedido.items:
        prod = db.query(Producto).filter(Producto.id == it.producto_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Producto {it.producto_id} no existe")
        if prod.stock is None or prod.stock < it.cantidad:
            raise HTTPException(status_code=409, detail=f"Sin stock suficiente para {prod.nombre}")
        prod.stock -= it.cantidad
    
    nuevo = Pedido(
        id=str(uuid4()), estado="pendiente", tipo="estandar",
        contacto_nombre=pedido.contacto.nombre,
        contacto_email=current_user.email,
        contacto_telefono=pedido.contacto.telefono,
    )
    
    db.add(nuevo)
    db.flush()
    
    for it in pedido.items:
        db.add(PedidoItemModel(pedido_id=nuevo.id, producto_id=it.producto_id, cantidad=it.cantidad))
    
    db.commit()
    db.refresh(nuevo)
    return to_response(nuevo)

@router.post("/personalizado", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido_personalizado(pedido: PedidoPersonalizado, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    nuevo = Pedido(
        id=str(uuid4()), estado="en revisión", tipo="personalizado",
        contacto_nombre=pedido.contacto.nombre,
        contacto_email=current_user.email,
        contacto_telefono=pedido.contacto.telefono,
        descripcion=pedido.descripcion,
        imagen_referencia=pedido.imagen_referencia,
    )
    
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return to_response(nuevo)

@router.get("/mis-pedidos", response_model=List[PedidoResponse])
def get_mis_pedidos(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    pedidos = db.query(Pedido).filter(Pedido.contacto_email == current_user.email).all()
    return [to_response(p) for p in pedidos]

# ✅ CORREGIDO: Cambiar de GET /all a GET /
@router.get("/", response_model=List[PedidoResponse], dependencies=[Depends(require_admin)])
def get_todos_pedidos(db: Session = Depends(get_db)):
    return [to_response(p) for p in db.query(Pedido).all()]

@router.put("/{pedido_id}/estado", response_model=PedidoResponse, dependencies=[Depends(require_admin)])
def actualizar_estado_pedido(pedido_id: str, estado_update: PedidoUpdateEstado, db: Session = Depends(get_db)):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    pedido.estado = estado_update.estado
    db.commit()
    db.refresh(pedido)
    return to_response(pedido)

@router.delete("/{pedido_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_pedido(pedido_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
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

# ✅ NUEVO ENDPOINT: Crear pedido como invitado (sin autenticación)
@router.post("/guest", response_model=GuestOrderResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido_invitado(order: GuestOrderCreate, db: Session = Depends(get_db)):
    """
    Permite a usuarios no registrados crear pedidos.
    No requiere autenticación.
    """
    
    # Validar que haya items
    if not order.items or len(order.items) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El pedido debe tener al menos un producto"
        )
    
    # Validar método de pago
    metodos_validos = ["transferencia", "efectivo", "tarjeta"]
    if order.guestInfo.metodoPago not in metodos_validos:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Método de pago inválido. Opciones: {', '.join(metodos_validos)}"
        )
    
    # Validar stock y productos
    for item in order.items:
        producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
        
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto {item.producto_id} no encontrado"
            )
        
        if producto.stock is None or producto.stock < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Stock insuficiente para {producto.nombre}. Disponible: {producto.stock}, Solicitado: {item.cantidad}"
            )
    
    # Crear el pedido
    nuevo_pedido = Pedido(
        id=str(uuid4()),
        estado="pendiente",
        tipo="invitado",  # ✅ Tipo especial para pedidos de invitados
        contacto_nombre=order.guestInfo.nombreCompleto,
        contacto_email=order.guestInfo.email,
        contacto_telefono=order.guestInfo.whatsapp,
        descripcion=f"Dirección: {order.guestInfo.direccion}\nMétodo de pago: {order.guestInfo.metodoPago}"
    )
    
    db.add(nuevo_pedido)
    db.flush()  # ✅ Obtener el ID antes de agregar items
    
    # Agregar items y descontar stock
    for item in order.items:
        # Crear item del pedido
        pedido_item = PedidoItemModel(
            pedido_id=nuevo_pedido.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad
        )
        db.add(pedido_item)
        
        # Descontar stock
        producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
        producto.stock -= item.cantidad
    
    # Guardar todo
    db.commit()
    db.refresh(nuevo_pedido)
    
    # ✅ Aquí puedes agregar lógica para enviar emails/notificaciones
    # enviar_email_confirmacion(order.guestInfo.email, nuevo_pedido.id, order.total)
    # enviar_whatsapp_notificacion(order.guestInfo.whatsapp, nuevo_pedido.id)
    
    return GuestOrderResponse(
        status="success",
        order_id=nuevo_pedido.id,
        message=f"Pedido creado exitosamente. Te contactaremos al email {order.guestInfo.email}"
    )