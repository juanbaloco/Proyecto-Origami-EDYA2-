from fastapi import APIRouter
from .productos import router as productos_router

api_router = APIRouter()
api_router.include_router(productos_router, prefix="/productos", tags=["productos"])
