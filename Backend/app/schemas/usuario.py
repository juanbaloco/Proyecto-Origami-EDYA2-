from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Schema base con campos comunes
class UsuarioBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

# Para CREAR un nuevo usuario (registro)
class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=6, max_length=100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "juan_perez",
                "email": "juan@example.com",
                "password": "mipassword123"
            }
        }

# Para ACTUALIZAR un usuario existente
class UsuarioUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "nuevo_username",
                "email": "nuevo@example.com"
            }
        }

# Para MOSTRAR información del usuario (respuesta)
class UsuarioResponse(UsuarioBase):
    id: int
    is_admin: bool = False
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "juan_perez",
                "email": "juan@example.com",
                "is_admin": False
            }
        }

# ALIAS para compatibilidad con imports existentes
UsuarioOut = UsuarioResponse

# Para el perfil completo del usuario (si necesitas más detalles después)
class UsuarioProfile(UsuarioResponse):
    """Schema extendido para perfil de usuario con información adicional"""
    pass
