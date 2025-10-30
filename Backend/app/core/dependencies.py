from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, ExpiredSignatureError

from app.db.database import get_db
from app.core.security import decode_access_token
from app.models.usuario import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_access_token(token)
    except (ExpiredSignatureError, JWTError):
        raise credentials_exception
    
    sub = payload.get("sub")
    if sub is None:
        raise credentials_exception
    
    # ✅ BUSCAR POR EMAIL (no por ID)
    user = db.query(Usuario).filter(Usuario.email == sub).first()
    
    if user is None:
        raise credentials_exception
    
    return user

async def require_admin(current_user: Usuario = Depends(get_current_user)):
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="No tienes permisos de administrador"
        )
    return current_user
