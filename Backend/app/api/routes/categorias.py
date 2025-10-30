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

@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def crear_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    existente = db.query(Categoria).filter(Categoria.slug == data.slug).first()
    if existente:
        raise HTTPException(status_code=409, detail="La categoría ya existe")
    nueva = Categoria(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

