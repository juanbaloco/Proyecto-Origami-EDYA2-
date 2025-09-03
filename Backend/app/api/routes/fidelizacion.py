from fastapi import APIRouter, HTTPException
from app.schemas.fidelizacion import Fidelizacion, FidelizacionCreate
from typing import List

router = APIRouter(prefix="/fidelizacion", tags=["fidelizacion"])

fidelizados_db: List[Fidelizacion] = []
id_counter = 1

@router.post("/", response_model=Fidelizacion, status_code=201)
def registrar_fidelizacion(data: FidelizacionCreate):
    global id_counter
    for f in fidelizados_db:
        if f.correo == data.correo:
            raise HTTPException(status_code=409, detail= "Correo ya registrado")
    nuevo = Fidelizacion(id=id_counter, **data.dict())
    fidelizados_db.append(nuevo)
    id_counter += 1
    return nuevo
@router.get("/{correo}", response_model=Fidelizacion)
def obtener_fidelizacion(correo: str):
    for f in fidelizados_db:
        if f.correo == correo:
            return f
    raise HTTPException(status_code=404, detail=" no encontrado")

@router.put("/{correo}", response_model=Fidelizacion)
def actualizar_fidelizacion(correo: str, data: FidelizacionCreate):
    for f in fidelizados_db:
        if f.correo == correo:
            f.nombre_completo = data.nombre_completo
            f.fecha_nacimiento = data.fecha_nacimiento
            f.redes = data.redes
            f.direccion = data.direccion
            return f
    raise HTTPException(status_code=404, detail=" no encontrado")

router.get("/{correo}/beneficios")
def beneficios_fidelizacion(correo: str):
    for f in fidelizados_db:
        if f.correo == correo:
            return{
                "correo": f.correo,
                "puntos": f.puntos,
                "tutoriales": f.tutoriales,
                "proximo_regalo": f.proximo_regalo or "Pendiente#"
            }
    raise HTTPException(status_code=404, detail=" no encontrado")