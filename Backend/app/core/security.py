from datetime import datetime, timedelta
from typing import Optional, Any, Dict
from jose import JWTError, jwt, ExpiredSignatureError
from passlib.context import CryptContext
from app.core.config import settings

# ❌ ELIMINAR ESTAS LÍNEAS:
# SECRET_KEY = "change_this_secret_in_env"
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# ✅ USAR DIRECTAMENTE DESDE settings
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(str(plain_password), hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(str(password))

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    
    # ✅ USAR settings.SECRET_KEY y settings.ALGORITHM
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        # ✅ USAR settings.SECRET_KEY y settings.ALGORITHM
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except (ExpiredSignatureError, JWTError) as e:
        raise e
