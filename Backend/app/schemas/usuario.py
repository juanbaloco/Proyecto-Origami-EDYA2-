from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Schema base con campos comunes
class UsuarioBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)  # ✅ username
    email: EmailStr

# Para CREAR un nuevo usuario (registro)
class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=6, max_length=100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "juanperez",  # ✅ username
                "email": "juan@example.com",
                "password": "mipassword123"
            }
        }

# Para ACTUALIZAR un usuario existente
class UsuarioUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)  # ✅ username
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "nuevousername",  # ✅ username
                "email": "nuevo@example.com"
            }
        }

# Para MOSTRAR información del usuario (respuesta)
class UsuarioResponse(UsuarioBase):
    id: int
    is_admin: bool = False  # ✅ is_admin
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "juanperez",  # ✅ username
                "email": "juan@example.com",
                "is_admin": False  # ✅ is_admin
            }
        }

# ALIAS para compatibilidad
UsuarioOut = UsuarioResponse

# Para el perfil completo del usuario
class UsuarioProfile(UsuarioResponse):
    """Schema extendido para perfil de usuario con información adicional"""
    pass
