from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.dependencies import get_db, get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.usuario import Usuario
from app.schemas.auth import Token
from app.schemas.usuario import UsuarioCreate, UsuarioOut
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ===== REGISTRO DE NUEVO USUARIO =====
@router.post("/register", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def register(user: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario en el sistema.
    
    - **username**: Nombre de usuario único
    - **email**: Correo electrónico único
    - **password**: Contraseña (será hasheada)
    """
    # Verificar si el email ya existe
    if db.query(Usuario).filter(Usuario.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="El correo electrónico ya está registrado"
        )
    
    # Verificar si el username ya existe
    if db.query(Usuario).filter(Usuario.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="El nombre de usuario ya está en uso"
        )
    
    # Crear nuevo usuario
    nuevo_usuario = Usuario(
        username=user.username,
        email=user.email,
        password_hash=get_password_hash(user.password),
        is_admin=False  # Por defecto, no es admin
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario

# ===== LOGIN (INICIAR SESIÓN) =====
@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Inicia sesión y devuelve un token JWT.
    
    - **username**: Email del usuario (el campo se llama username por OAuth2, pero usamos email)
    - **password**: Contraseña del usuario
    
    Returns: access_token y token_type
    """
    # Buscar usuario por email (username en el form es el email)
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado. Verifica el correo electrónico."
        )
    
    # Verificar contraseña
    if not verify_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta"
        )
    
    # Generar token JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)  # ← CORREGIDO AQUÍ
    access_token = create_access_token(
        data={"sub": usuario.email, "is_admin": usuario.is_admin},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer"
    }

# ===== OBTENER INFORMACIÓN DEL USUARIO ACTUAL =====
@router.get("/me", response_model=UsuarioOut)
def get_current_user_info(current_user: Usuario = Depends(get_current_user)):
    """
    Obtiene la información del usuario autenticado actualmente.
    
    Requiere: Token JWT válido en el header Authorization
    
    Returns: Datos del usuario (sin la contraseña)
    """
    return current_user
