from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Response
from ...core.store import (
    add_product, list_products, get_product, update_product, delete_product,
    CATEGORY_SLUGS
)
from ...schemas.producto import ProductoCreate, ProductoUpdate, ProductoOut

router = APIRouter()

@router.get("", response_model=List[ProductoOut])
def list_endpoint(
    response: Response,
    q: Optional[str] = None,
    categoria: Optional[str] = Query(default=None, description="3d|filigrama|pliegues|ensambles"),
    offset: int = 0,
    limit: int = Query(default=10, le=50),
):
    if categoria and categoria.lower() not in CATEGORY_SLUGS:
        raise HTTPException(status_code=422, detail="categoria no válida")
    items = list_products(q, categoria.lower() if categoria else None)
    response.headers["X-Total-Count"] = str(len(items))
    return items[offset: offset + limit]

@router.get("/{product_id}", response_model=ProductoOut)
def get_endpoint(product_id: str):
    p = get_product(product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return p

@router.post("", response_model=ProductoOut, status_code=201)
def create_endpoint(payload: ProductoCreate):
    try:
        return add_product(payload.model_dump())
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=409, detail=str(ke))

@router.patch("/{product_id}", response_model=ProductoOut)
def update_endpoint(product_id: str, payload: ProductoUpdate):
    try:
        return update_product(product_id, payload.model_dump(exclude_unset=True))
    except LookupError:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=409, detail=str(ke))

@router.delete("/{product_id}", status_code=204)
def delete_endpoint(product_id: str):
    ok = delete_product(product_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return Response(status_code=204)

