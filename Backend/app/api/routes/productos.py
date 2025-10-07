# Backend/app/api/routes/productos.py

from fastapi import APIRouter, Depends, HTTPException, Query, status

from typing import List

from app.core.dependencies import get_db, require_admin
from app.schemas.producto import Producto


from sqlalchemy.orm import Session
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoOut 

# ⬇️⬇️⬇️  ESTO ES CLAVE
router = APIRouter(prefix="/productos", tags=["productos"])

# LISTAR  -> /api/productos  y  /api/productos/


@router.get("/", response_model=List[ProductoOut])
def list_endpoint(
    q: str = None,
    categoria: str = Query(default=None, description="3d|filigrama|pliegues|ensambles"),
    offset: int = 0,
    limit: int = Query(default=10, le=50),
    db: Session = Depends(get_db),
):
    if categoria and categoria.lower() not in {"3d", "filigrama", "pliegues", "ensambles"}:
        raise HTTPException(status_code=422, detail="categoria no válida")
    query= db.query(Producto).filter(Producto.activo == 1)
    if q:
        query = query.filter(Producto.nombre.ilike(f"%{q}%") | Producto.descripcion.ilike(f"%{q}%"))
    if categoria:
        query = query.filter(Producto.categoria_slug == categoria.lower())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return items

##@router.get("/{product_id}", response_model=ProductoOut)
#def get_endpoint(product_id: str):
 
 #   p = get_product(product_id)
  #  if not p:
   #     raise HTTPException(status_code=404, detail="Producto no encontrado")
    #return p

# CREAR  -> /api/productos  y  /api/productos/
@router.post("", response_model=ProductoOut, status_code=201, dependencies=[Depends(require_admin)])
def create_endpoint(payload: ProductoCreate, db: Session = Depends(get_db)):
  product = Producto(**payload.dict())
  db.add(product)
  db.commit()
  db.refresh(product)
  return product

# ACTUALIZAR  -> /api/productos/{product_id}


@router.patch("/{product_id}", response_model=ProductoOut, dependencies=[Depends(require_admin)])
def update_endpoint(product_id: str, payload: ProductoUpdate, db: Session = Depends(get_db)):
    product = db.query(Producto).filter(Producto.UniqueID == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_endpoint(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Producto).filter(Producto.UniqueID == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product.activo = 0 
    db.commit()
    return 
