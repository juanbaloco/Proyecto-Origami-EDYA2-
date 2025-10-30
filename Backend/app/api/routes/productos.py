from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.dependencies import get_db, require_admin
from app.models.producto import Producto as ProductoModel
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoOut

router = APIRouter(prefix="/api/productos", tags=["productos"])

# IMPORTANTE: usa "" para aceptar ambas /api/productos y /api/productos/
@router.get("", response_model=List[ProductoOut])
@router.get("/", response_model=List[ProductoOut])
def list_productos(
    q: Optional[str] = Query(None),
    categoria: Optional[str] = Query(None, description="3d|filigrama|pliegues|ensambles"),
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(ProductoModel).filter(ProductoModel.activo == True)
    if q:
        p = f"%{q}%"
        query = query.filter(or_(ProductoModel.nombre.ilike(p), ProductoModel.descripcion.ilike(p)))
    if categoria:
        query = query.filter(ProductoModel.categoria_slug == categoria.lower())
    items = query.offset(offset).limit(limit).all()
    return items

@router.post("", response_model=ProductoOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
@router.post("/", response_model=ProductoOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_producto(payload: ProductoCreate, db: Session = Depends(get_db)):
    obj = ProductoModel(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/{producto_id}", response_model=ProductoOut)
def get_producto(producto_id: int, db: Session = Depends(get_db)):
    obj = db.query(ProductoModel).filter(ProductoModel.id == producto_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return obj

@router.put("/{producto_id}", response_model=ProductoOut, dependencies=[Depends(require_admin)])
def update_producto(producto_id: int, payload: ProductoUpdate, db: Session = Depends(get_db)):
    obj = db.query(ProductoModel).filter(ProductoModel.id == producto_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_producto(producto_id: int, db: Session = Depends(get_db)):
    obj = db.query(ProductoModel).filter(ProductoModel.id == producto_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(obj)
    db.commit()
