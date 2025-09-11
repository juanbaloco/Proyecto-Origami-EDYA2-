from fastapi import FastAPI
from app.core.cors import setup_cors
from app.api.routes import productos, pedidos, carrito, fidelizacion

app = FastAPI(title="Origami API (in-memory)", version="0.1.0")
setup_cors(app)

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

app.include_router(productos.router,    prefix="/api")
app.include_router(pedidos.router,      prefix="/api")
app.include_router(carrito.router,      prefix="/api")
app.include_router(fidelizacion.router, prefix="/api")
