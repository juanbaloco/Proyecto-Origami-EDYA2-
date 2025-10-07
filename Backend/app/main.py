from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.cors import settings 
from app.middleware.rate_limit import limiter 

from app.api.routes import auth, categorias, productos, pedidos, carrito, fidelizacion

app = FastAPI(title="Origami 3D tienda API", description= "API REST para tienda online de figuras de origami 3D" , version="0.1.0", docs_url="/docs", redoc_url="/redoc")


# CONFIGURACION DE LIMIADOR DE PETICIONES

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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