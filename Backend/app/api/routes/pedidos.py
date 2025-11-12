from fastapi import APIRouter, HTTPException, Depends, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import uuid

# ✅ Imports correctos de dependencias
from app.core.dependencies import get_db, require_admin, get_current_user

# ✅ Imports de modelos de base de datos
from app.models.pedido import Pedido, PedidoItem
from app.models.producto import Producto

# ✅ Imports de schemas (Pydantic)
from app.schemas.pedido import (
    PedidoCreate,
    PedidoResponse,
    PedidoPersonalizado,
    PedidoUpdateEstado,
    PedidoItem as PedidoItemSchema,
    Contacto,
    GuestOrderCreate,
    GuestOrderResponse
)

router = APIRouter(prefix="/api/pedidos", tags=["pedidos"])

# ✅ Helper function CON imagen_url
def to_response(p: Pedido, db: Session) -> PedidoResponse:
    # ✅ Agregar nombres, precios E IMÁGENES de productos
    items_with_names = []
    for it in p.items:
        producto = db.query(Producto).filter(Producto.id == it.producto_id).first()
        items_with_names.append(
            PedidoItemSchema(
                producto_id=it.producto_id,
                nombre=producto.nombre if producto else "Producto no encontrado",
                cantidad=it.cantidad,
                precio=producto.precio if producto else 0,
                imagen_url=producto.imagen_url if producto else None  # ✅ AGREGADO
            )
        )
    
    return PedidoResponse(
        pedido_id=p.id,
        estado=p.estado,
        tipo=p.tipo,
        total=p.total,
        descripcion=p.descripcion,
        imagen_referencia=p.imagen_referencia,
        nombre_personalizado=p.nombre_personalizado,
        precio_personalizado=p.precio_personalizado,
        comentario_vendedor=p.comentario_vendedor,
        comentario_cancelacion=p.comentario_cancelacion,
        contacto=Contacto(
            nombre=p.contacto_nombre,
            email=p.contacto_email,
            telefono=p.contacto_telefono
        ),
        items=items_with_names,
        direccion=p.direccion,
        metodo_pago=p.metodo_pago
    )

# ✅ Schema para actualizar pedido personalizado
class ActualizarPedidoPersonalizadoRequest(BaseModel):
    nombre_personalizado: Optional[str] = None
    precio_personalizado: Optional[float] = None
    comentario_vendedor: Optional[str] = None

# ============================================
# CREAR PEDIDO (USUARIO AUTENTICADO)
# ============================================

@router.post("/", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    pedido: PedidoCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear pedido estándar para usuario autenticado"""
    if not pedido.items:
        raise HTTPException(status_code=422, detail="El pedido debe tener items")
    
    # Validar y descontar stock
    total = 0.0
    for it in pedido.items:
        prod = db.query(Producto).filter(Producto.id == it.producto_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Producto {it.producto_id} no existe")
        if prod.stock is None or prod.stock < it.cantidad:
            raise HTTPException(status_code=409, detail=f"Sin stock suficiente para {prod.nombre}")
        prod.stock -= it.cantidad
        total += prod.precio * it.cantidad
    
    # ✅ Crear pedido
    nuevo = Pedido(
        id=str(uuid.uuid4()),
        estado="pendiente",
        tipo="estandar",
        total=total,
        contacto_nombre=pedido.contacto.nombre,
        contacto_email=current_user.email,
        contacto_telefono=pedido.contacto.telefono,
        direccion=pedido.direccion,
        metodo_pago=pedido.metodo_pago
    )
    
    db.add(nuevo)
    db.flush()
    
    for it in pedido.items:
        db.add(PedidoItem(pedido_id=nuevo.id, producto_id=it.producto_id, cantidad=it.cantidad))
    
    db.commit()
    db.refresh(nuevo)
    
    return to_response(nuevo, db)

# ============================================
# CREAR PEDIDO (INVITADO - GUEST)
# ============================================

@router.post("/guest", response_model=GuestOrderResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido_invitado(pedido: GuestOrderCreate, db: Session = Depends(get_db)):
    """Crear pedido sin autenticación (usuario invitado)"""
    if not pedido.items:
        raise HTTPException(status_code=422, detail="El pedido debe tener items")
    
    # Validar stock
    total = 0.0
    for it in pedido.items:
        prod = db.query(Producto).filter(Producto.id == it.producto_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Producto {it.producto_id} no existe")
        if prod.stock is None or prod.stock < it.cantidad:
            raise HTTPException(status_code=409, detail=f"Sin stock suficiente para {prod.nombre}")
        prod.stock -= it.cantidad
        total += prod.precio * it.cantidad
    
    # ✅ Crear pedido invitado
    nuevo = Pedido(
        id=f"GUEST-{uuid.uuid4().hex[:8].upper()}",
        estado="pendiente",
        tipo="estandar",
        total=total,
        contacto_nombre=pedido.contacto.nombre,
        contacto_email=pedido.contacto.email,
        contacto_telefono=pedido.contacto.telefono,
        direccion=pedido.direccion,
        metodo_pago=pedido.metodo_pago
    )
    
    db.add(nuevo)
    db.flush()
    
    for it in pedido.items:
        db.add(PedidoItem(pedido_id=nuevo.id, producto_id=it.producto_id, cantidad=it.cantidad))
    
    db.commit()
    
    return GuestOrderResponse(message="Pedido creado exitosamente", pedido_id=nuevo.id)

# ============================================
# MIS PEDIDOS (USUARIO AUTENTICADO)
# ============================================

@router.get("/mis-pedidos", response_model=List[PedidoResponse])
def obtener_mis_pedidos(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Obtener pedidos del usuario autenticado"""
    pedidos_db = db.query(Pedido).filter(
        Pedido.contacto_email == current_user.email
    ).all()
    
    return [to_response(p, db) for p in pedidos_db]

# ============================================
# PEDIDO PERSONALIZADO
# ============================================

@router.post("/personalizado", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido_personalizado(
    pedido: PedidoPersonalizado,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear un pedido personalizado"""
    nuevo = Pedido(
        id=f"CUSTOM-{uuid.uuid4().hex[:8].upper()}",
        estado="pendiente",
        tipo="personalizado",
        descripcion=pedido.descripcion,
        imagen_referencia=pedido.imagen_referencia,
        nombre_personalizado=pedido.nombre_personalizado,
        contacto_nombre=pedido.contacto.nombre,
        contacto_email=current_user.email,
        contacto_telefono=pedido.contacto.telefono,
        direccion=pedido.direccion,
        metodo_pago=pedido.metodo_pago
    )
    
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    
    return to_response(nuevo, db)

# ============================================
# ADMIN: VER TODOS LOS PEDIDOS
# ============================================

@router.get("/", dependencies=[Depends(require_admin)])
def obtener_todos_pedidos(db: Session = Depends(get_db)):
    """Obtener todos los pedidos (solo admin)"""
    pedidos = db.query(Pedido).all()
    return pedidos

# ============================================
# ADMIN: OBTENER PEDIDOS NORMALES
# ============================================

@router.get("/normales", response_model=List[PedidoResponse], dependencies=[Depends(require_admin)])
def obtener_pedidos_normales(db: Session = Depends(get_db)):
    """Obtener todos los pedidos normales/estándar (solo admin)"""
    pedidos = db.query(Pedido).filter(Pedido.tipo == "estandar").all()
    return [to_response(p, db) for p in pedidos]

# ============================================
# ADMIN: OBTENER PEDIDOS PERSONALIZADOS
# ============================================

@router.get("/personalizados", response_model=List[PedidoResponse], dependencies=[Depends(require_admin)])
def obtener_pedidos_personalizados(db: Session = Depends(get_db)):
    """Obtener todos los pedidos personalizados (solo admin)"""
    pedidos = db.query(Pedido).filter(Pedido.tipo == "personalizado").all()
    return [to_response(p, db) for p in pedidos]

# ============================================
# ADMIN: ACTUALIZAR ESTADO DEL PEDIDO
# ============================================

@router.put("/{pedido_id}/estado", dependencies=[Depends(require_admin)])
def actualizar_estado_pedido(
    pedido_id: str,
    estado: str = Body(...),
    comentario_cancelacion: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    pedido.estado = estado
    if estado == "cancelado" and comentario_cancelacion:
        pedido.comentario_cancelacion = comentario_cancelacion
    
    db.commit()
    db.refresh(pedido)
    return pedido

# ============================================
# ADMIN: ACTUALIZAR PEDIDO PERSONALIZADO
# ============================================

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