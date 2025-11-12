from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_db, get_current_user, require_admin
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


# ADMIN: listar todos los fidelizados
@router.get("/", response_model=List[FidelizacionResponse], dependencies=[Depends(require_admin)])
def listar_fidelizados(db: Session = Depends(get_db)):
    return db.query(Fidelizacion).all()


# ADMIN: aceptar a un fidelizado manualmente
@router.post("/{correo}/accept", dependencies=[Depends(require_admin)])
def accept_fidelizado(correo: str, db: Session = Depends(get_db)):
    fid = db.query(Fidelizacion).filter(Fidelizacion.correo == correo).first()
    if not fid:
        raise HTTPException(status_code=404, detail="Fidelización no encontrada")
    fid.proximo_regalo = "ACEPTADO"
    db.add(fid)
    db.commit()
    db.refresh(fid)
    return fid


# CLIENT: marcar pago de fidelización (ejecutado por frontend tras pago)
@router.post("/{correo}/pagar")
def pagar_fidelizacion(correo: str, db: Session = Depends(get_db)):
    fid = db.query(Fidelizacion).filter(Fidelizacion.correo == correo).first()
    if not fid:
        raise HTTPException(status_code=404, detail="Fidelización no encontrada")
    fid.proximo_regalo = "ACEPTADO"
    # opcional: otorgar puntos iniciales
    fid.puntos = (fid.puntos or 0) + 100
    db.add(fid)
    db.commit()
    db.refresh(fid)
    return fid

