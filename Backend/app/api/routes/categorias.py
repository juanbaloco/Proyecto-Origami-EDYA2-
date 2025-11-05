from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, require_admin
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaResponse

# ✅ CORRECCIÓN: Agregar prefix /api para que coincida con el frontend
router = APIRouter(prefix="/api/categorias", tags=["categorias"])

@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    """
    Obtener todas las categorías disponibles.
    No requiere autenticación.
    """
    return db.query(Categoria).all()

@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def crear_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    """
    Crear una nueva categoría (solo administradores).
    """
    existente = db.query(Categoria).filter(Categoria.slug == data.slug).first()
    if existente:
        raise HTTPException(status_code=409, detail="La categoría ya existe")
    nueva = Categoria(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    """
    Eliminar una categoría por su ID (solo administradores).
    """
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(categoria)
    db.commit()
    return None
