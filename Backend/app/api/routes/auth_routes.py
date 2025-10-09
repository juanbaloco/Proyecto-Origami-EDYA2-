from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.dependencies import get_db, get_current_user
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioResponse 
from app.schemas.token import Token 



router = APIRouter(tags =["auth"], prefix="/auth")

#Login para admin y usuario normal

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o Contraseña incorrectos",
            
        )
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "is_admin": user.is_admin},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ver datos del usuario atenticado "me"

@router.get("/me", response_model=UsuarioResponse)
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user 

@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: dict, db: Session = Depends(get_db)):
    username = str(payload.get("username") or "").strip()
    email = str(payload.get("email") or "").strip().lower()
    password = str(payload.get("password") or "")
    if not username or not email or not password:
        raise HTTPException(status_code=400, detail="username, email y password son obligatorios")

    # Unicidad
    exists = db.query(Usuario).filter(
        (Usuario.email == email) | (Usuario.username == username)
    ).first()
    if exists:
        raise HTTPException(status_code=409, detail="Username o email ya están registrados")

    # Crear usuario
    user = Usuario(
        username=username,
        email=email,
        password_hash=get_password_hash(password),
        is_admin=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin,
    }