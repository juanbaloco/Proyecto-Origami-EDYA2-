from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_db, require_admin
from app.models.categoria import Categoria 
from app.schemas.categoria import CategoriaCreate, CategoriaResponse

router = APIRouter(prefix="/categorias", tags=["categorias"])

@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()

@router.post("/", response_model=CategoriaResponse,dependencies=[Depends(require_admin)])
def crear_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    categoria_existente = db.query(Categoria).filter(Categoria.slug == data.slug).first()
    if categoria_existente:
        raise HTTPException(status_code=409, detail="La categoría ya existe")
    nueva_categoria = Categoria(**Categoria.dict())
    db.add(nueva_categoria)
    db.commit()
    db.refresh(nueva_categoria)
    return nueva_categoria
