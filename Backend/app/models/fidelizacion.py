from sqlalchemy import Column, String, Integer, JSON
from app.db.database import Base

class Fidelizacion(Base):
    __tablename__ = "Fidelizacion"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    correo = Column(String, unique=True, nullable=False, index=True)
    nombre_completo = Column(String, nullable=False)
    fecha_nacimiento = Column(String, nullable=False)
    redes = Column(JSON, nullable=True)  # Lista de redes sociales
    direccion = Column(String, nullable=True)
    puntos = Column(Integer, default=0)
    tutoriales = Column(JSON, nullable=True, default=list)  # Lista de tutoriales
    proximo_regalo = Column(String, nullable=True)