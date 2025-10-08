from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.db import database
database.Base.metadata.create_all(bind=database.engine)

from app.core.cors import settings 

from app.api.routes import auth, categorias, productos, pedidos, carrito, fidelizacion

app = FastAPI(title="Origami 3D tienda API", description= "API REST para tienda online de figuras de origami 3D" , version="0.1.0", docs_url="/docs", redoc_url="/redoc")


# CONFIGURACION DE LIMIADOR DE PETICIONES


#CONFIGURACION DE CORS MIDDLEWARE 

app.add_middleware(
    CORSMiddleware,
    allow_origins = settings.cors_origins, #Desde . env
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

#REGISTRO DE RUTASS 

#AGREGADO:

app.include_router(
    auth.router, 
    prefix="/api",
    tags=["Autenticacion"],
)
app.include_router(
    categorias.router,
    prefix="/api",
    tags=["Categorias"]
)


app.include_router(
    productos.router,
    prefix="/api",
    tags=["Productos"]
)


app.include_router(
    pedidos.router,
    prefix="/api",
    tags=["Pedidos"]
)

app.include_router(carrito.router,  
   prefix="/api",
   tags=["Carrito"])
app.include_router(fidelizacion.router,
     prefix="/api",
     tags=["Fidelizacion"]
)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}