from fastapi import FastAPI
from .core.cors import setup_cors
from .api.routes import productos, pedidos, carrito, fidelizacion

app = FastAPI(title="Origami API (in-memory)", version="0.1.0")
setup_cors(app)

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

app.include_router(productos.router)
app.include_router(pedidos.router)
app.include_router(carrito.router)
app.include_router(fidelizacion.router)
