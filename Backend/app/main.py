# backend/app/main.py

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

# ✅ Usar database.py directamente
from app.db.database import Base, engine, SessionLocal

# ✅ Importar TODOS los modelos ANTES de create_all
from app.models.usuario import Usuario
from app.models.producto import Producto
from app.models.pedido import Pedido, PedidoItem
from app.models.carrito import Carrito, ItemCarrito
from app.models.categoria import Categoria
from app.models.fidelizacion import Fidelizacion

from app.core.cors import setup_cors, settings
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
    """Crea el usuario admin inicial si no existe"""
    db = SessionLocal()
    try:
        email = "balocojuan@gmail.com"
        username = "admin"  # ← Campo correcto
        
        # Verificar si el admin ya existe
        admin_exists = db.query(Usuario).filter(Usuario.email == email).first()
        
        if not admin_exists:
            # ✅ USAR LOS CAMPOS CORRECTOS DEL MODELO
            admin = Usuario(
                username=username,           # ← Correcto
                email=email,                 # ← Correcto
                password_hash=get_password_hash("Admin123*"),  # ← Correcto
                is_admin=True,               # ← Correcto
                activo=True                  # ← Correcto (agregado)
            )
            db.add(admin)
            db.commit()
            print("✅ [seed] Usuario admin creado exitosamente")
        else:
            # Si existe, asegurarse de que tenga permisos de admin
            if not admin_exists.is_admin:
                admin_exists.is_admin = True
                db.commit()
                print("✅ [seed] Usuario admin actualizado con permisos")
            else:
                print("✅ [seed] Usuario admin ya existe")
                
    except Exception as e:
        print(f"❌ Error en seed_admin: {e}")
        db.rollback()
    finally:
        db.close()

# ✅ CONFIGURAR CORS ANTES de registrar rutas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Evento que se ejecuta al iniciar la aplicación"""
    try:
        print("🔄 Creando tablas en la base de datos...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente")
        
        # Crear usuario admin inicial
        seed_admin()
        
    except Exception as e:
        print(f"❌ Error en startup: {e}")

# ✅ Servir archivos estáticos
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# REGISTRO DE RUTAS
app.include_router(auth_router)
app.include_router(productos_router)
app.include_router(pedidos_router)
app.include_router(categorias_router)
app.include_router(fidelizacion_router)
app.include_router(carrito_router)

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
