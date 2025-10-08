from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_db, get_current_user
from app.schemas.fidelizacion import Fidelizacion, FidelizacionCreate, FidelizacionResponse
from app.models.fidelizacion import Fidelizacion 

router = APIRouter(prefix="/fidelizacion", tags=["fidelizacion"])


@router.post("/", response_model=FidelizacionResponse, status_code=201)
def registrar_fidelizacion(data: FidelizacionCreate, db: Session = Depends(get_db)):
    existente = db.query(Fidelizacion).filter(Fidelizacion.correo == data.correo).first()
    if existente:
        raise HTTPException(status_code=409, detail="El correo ya está registrado")
    nuevo_fidelizado = Fidelizacion(**data.dict())
    db.add(nuevo_fidelizado)
    db.commit()
    db.refresh(nuevo_fidelizado)
    return nuevo_fidelizado
@router.get("/{correo}", response_model=FidelizacionResponse, status_code=200)
def obtener_fidelizacion(correo: str, db: Session = Depends(get_db)):
    fidelizado = db.query(Fidelizacion).filter(Fidelizacion.correo == correo).first()
    if not fidelizado:
        raise HTTPException(status_code=404, detail="Fidelización no encontrada")
    return fidelizado

