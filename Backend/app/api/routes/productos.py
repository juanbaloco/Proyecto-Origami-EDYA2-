from typing import List, Optional
import time
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.dependencies import get_db, require_admin
from app.models.producto import Producto as ProductoModel
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoOut

router = APIRouter(prefix="/api/productos", tags=["productos"])

# 📁 Carpeta donde se guardarán las imágenes
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ✅ ENDPOINT DE LISTADO
@router.get("/", response_model=List[ProductoOut])
def list_productos(
    q: Optional[str] = Query(None),
    categoria: Optional[str] = Query(None, description="Filtrar por slug de categoría"),
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Lista todos los productos con búsqueda opcional y filtro por categoría (slug).
    """
    query = db.query(ProductoModel).filter(ProductoModel.activo == True)
    
    # Filtro por nombre (búsqueda)
    if q:
        query = query.filter(or_(
            ProductoModel.nombre.ilike(f"%{q}%"),
            ProductoModel.descripcion.ilike(f"%{q}%")
        ))
    
    # ✅ Filtro por slug de categoría
    if categoria:
        query = query.filter(ProductoModel.categoria == categoria)
    
    return query.offset(offset).limit(limit).all()

# ✅ ENDPOINT DE CREACIÓN CON IMAGEN (SOLO UN DECORADOR)
@router.post("/", response_model=ProductoOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_producto(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    precio: float = Form(..., gt=0),
    stock: int = Form(..., ge=0),
    color: Optional[str] = Form(None),
    tamano: Optional[str] = Form(None),
    material: Optional[str] = Form(None),
    categoria: Optional[str] = Form(None),
    activo: str = Form("true"),
    imagen: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    activo_bool = activo.lower() == "true"
    img_url = None
    if imagen and imagen.filename and imagen.size > 0:
        timestamp = str(int(time.time() * 1000))
        clean_name = imagen.filename.replace(" ", "_")
        file_name = f"{timestamp}_{clean_name}"
        file_path = UPLOAD_DIR / file_name
        try:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(imagen.file, buffer)
            img_url = f"/uploads/{file_name}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al guardar imagen: {str(e)}")
    nuevo_producto = ProductoModel(
        nombre=nombre,
        descripcion=descripcion,
        precio=precio,
        color=color,
        tamano=tamano,
        material=material,
        imagen_url=img_url,
        activo=activo_bool,
        stock=stock,
        categoria=categoria
    )
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto

# ✅ ENDPOINT DE ACTUALIZACIÓN
@router.put("/{producto_id}", response_model=ProductoOut, dependencies=[Depends(require_admin)])
def update_producto(
    producto_id: int,
    data: ProductoUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un producto existente"""
    producto = db.query(ProductoModel).filter(ProductoModel.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(producto, key, value)
    
    db.commit()
    db.refresh(producto)
    return producto

# ✅ ENDPOINT DE ELIMINACIÓN
@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_producto(producto_id: int, db: Session = Depends(get_db)):
    """Eliminar un producto"""
    producto = db.query(ProductoModel).filter(ProductoModel.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    db.delete(producto)
    db.commit()
    return None

# ✅ OBTENER UN PRODUCTO POR ID (DEBE IR AL FINAL)
@router.get("/{producto_id}", response_model=ProductoOut)
def get_producto(producto_id: int, db: Session = Depends(get_db)):
    """Obtener un producto específico por ID"""
    producto = db.query(ProductoModel).filter(ProductoModel.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto
