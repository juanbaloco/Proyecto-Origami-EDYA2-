from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.core.security import get_password_hash

def seed_data(db: Session):
    """
    Crea datos iniciales en la base de datos si no existen.
    """
    try:
        # Verificar si existe usuario admin@origami.com
        admin_user = db.query(Usuario).filter(Usuario.email == "admin@origami.com").first()
        if not admin_user:
            admin = Usuario(
                username="admin",
                email="admin@origami.com",
                password_hash=get_password_hash("admin123"),
                is_admin=True,
                activo=True
            )
            db.add(admin)
            db.commit()
            print("✅ [seed] Usuario admin creado exitosamente")
        else:
            print("✅ [seed] Usuario admin ya existe")

        # Puedes crear aquí otros usuarios si lo necesitas
        user = db.query(Usuario).filter(Usuario.email == "balocojuan@gmail.com").first()
        if not user:
            nuevo_user = Usuario(
                username="balocojuan",
                email="balocojuan@gmail.com",
                password_hash=get_password_hash("Admin123*"),
                is_admin=True,          # o False según el caso
                activo=True
            )
            db.add(nuevo_user)
            db.commit()
            print("✅ [seed] Usuario balocojuan creado exitosamente")
        else:
            print("✅ [seed] Usuario balocojuan ya existe")

    except Exception as e:
        print(f"❌ Error en seed_data: {e}")
        db.rollback()
