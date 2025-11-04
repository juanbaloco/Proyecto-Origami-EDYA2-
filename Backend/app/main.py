from fastapi import FastAPI

from fastapi.staticfiles import StaticFiles
from pathlib import Path

from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine, SessionLocal
from app.models import producto as producto_model
from app.models import categoria as categoria_model
from app.models.usuario import Usuario
from app.core.cors import setup_cors
from app.core.cors import settings
from app.core.security import get_password_hash

# IMPORTAR ROUTERS
from app.api.routes.auth_routes import router as auth_router
from app.api.routes.productos import router as productos_router
from app.api.routes.pedidos import router as pedidos_router
from app.api.routes.categorias import router as categorias_router
from app.api.routes.fidelizacion import router as fidelizacion_router
from app.api.routes.carrito import router as carrito_router

app = FastAPI(
    title="Origami 3D tienda API",
    description="API REST para tienda online de figuras de origami 3D",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

def seed_admin():
    db = SessionLocal()
    try:
        email = "balocojuan@gmail.com"
        username = "balocojuan"
        if not db.query(Usuario).filter(Usuario.email == email).first():
            admin = Usuario(
                username=username,
                email=email,
                password_hash=get_password_hash("Admin123*"),
                is_admin=True
            )
            db.add(admin)
            db.commit()
            print("[seed] Usuario admin creado")
        else:
            admin = db.query(Usuario).filter(Usuario.email == email).first()
            if not admin.is_admin:
                admin.is_admin = True
                db.commit()
            print("[seed] Usuario admin ya existe")
    finally:
        db.close()

setup_cors(app)

@app.on_event("startup")
def on_startup():
    # Al llegar aquí, los modelos ya están importados
    Base.metadata.create_all(bind=engine)
    seed_admin()

# CONFIGURACION DE CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Desde .env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ✅ Servir archivos estáticos desde /uploads
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# REGISTRO DE RUTAS
# ⚠️ IMPORTANTE: NO agregues prefix="/api" porque los routers YA lo tienen
app.include_router(auth_router)         # Ya tiene prefix="/api/auth"
app.include_router(productos_router)    # Ya tiene prefix="/api/productos"
app.include_router(pedidos_router)      # Ya tiene prefix="/api/pedidos"
app.include_router(categorias_router)   # Ya tiene prefix="/api/categorias"
app.include_router(fidelizacion_router) # Ya tiene prefix="/api/fidelizacion"
app.include_router(carrito_router)      # Ya tiene prefix="/api/carrito"

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
