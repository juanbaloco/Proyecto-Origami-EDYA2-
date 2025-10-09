from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.db.database import Base, engine
from sqlalchemy.exc import SQLAlchemyError

from app.models import producto as producto_model
from app.models import categoria as categoria_model

from app.core.cors import settings 

from app.api.routes.auth_routes import router as auth_router
from app.api.routes.productos import router as productos_router
from app.api.routes.pedidos import router as pedidos_router
from app.api.routes.categorias import router as categorias_router
from app.api.routes.fidelizacion import router as fidelizacion_router
from app.api.routes.carrito import router as carrito_router


app = FastAPI(title="Origami 3D tienda API", description= "API REST para tienda online de figuras de origami 3D" , version="0.1.0", docs_url="/docs", redoc_url="/redoc")


@app.on_event("startup")
def on_startup():
# Al llegar aquí, los modelos ya están importados
    Base.metadata.create_all(bind=engine)

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

app.include_router(auth_router, prefix="/api", tags=["Autenticacion"])
app.include_router(productos_router, prefix="/api", tags=["Productos"])
app.include_router(pedidos_router, prefix="/api", tags=["Pedidos"])
app.include_router(categorias_router, prefix="/api", tags=["Categorias"])
app.include_router(fidelizacion_router, prefix="/api", tags=["Fidelizacion"])
app.include_router(carrito_router, prefix="/api", tags=["Carrito"])

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}