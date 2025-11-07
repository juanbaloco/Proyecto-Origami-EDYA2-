# backend/app/core/dependencies.py

"""
Módulo de dependencias para FastAPI.
Gestiona la inyección de dependencias en las rutas de la API.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.db.database import SessionLocal
from app.core.config import settings
from app.models.usuario import Usuario


# OAuth2 scheme para autenticación con tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_db():
    """
    Crea y gestiona una sesión de base de datos.
    
    Yields:
        Session: Sesión de SQLAlchemy para interactuar con la base de datos
    
    Uso:
        db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Obtiene el usuario actual autenticado desde el token JWT.
    
    Args:
        token (str): Token JWT del header Authorization
        db (Session): Sesión de base de datos
    
    Returns:
        Usuario: Objeto Usuario autenticado
    
    Raises:
        HTTPException: 401 si el token es inválido o el usuario no existe
    
    Uso:
        current_user: Usuario = Depends(get_current_user)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodificar token JWT
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        is_admin: bool = payload.get("is_admin", False)  # ✅ is_admin
        
        if email is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Buscar usuario en la base de datos
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario is None:
        raise credentials_exception
    
    return usuario


def require_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """
    Verifica que el usuario actual sea administrador.
    
    Esta dependencia se usa para proteger rutas que solo pueden acceder administradores.
    
    Args:
        current_user (Usuario): Usuario autenticado actual
    
    Returns:
        Usuario: El mismo usuario si es admin
    
    Raises:
        HTTPException: 403 Forbidden si el usuario no es administrador
    
    Uso:
        current_admin: Usuario = Depends(require_admin)
    """
    if not current_user.is_admin:  # ✅ is_admin
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador para acceder a este recurso"
        )
    return current_user


def get_optional_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario | None:
    """
    Obtiene el usuario actual si está autenticado, o None si no lo está.
    
    Útil para endpoints que funcionan tanto para usuarios autenticados como no autenticados.
    
    Args:
        token (str): Token JWT opcional
        db (Session): Sesión de base de datos
    
    Returns:
        Usuario | None: Usuario autenticado o None
    
    Uso:
        optional_user: Usuario | None = Depends(get_optional_user)
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            return None
            
        usuario = db.query(Usuario).filter(Usuario.email == email).first()
        return usuario
        
    except JWTError:
        return None
