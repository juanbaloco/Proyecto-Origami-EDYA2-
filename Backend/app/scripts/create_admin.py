from app.db.database import SessionLocal
from app.models.usuario import Usuario
from app.core.security import get_password_hash

def run():
    email = "admin@example.com" # usa un email válido
    username = "admin"
    password = "admin123"
    print("[create_admin] Iniciando...")


    with SessionLocal() as db:
        u = db.query(Usuario).filter(Usuario.username == username).first()

        if u:
            # actualizar email, password y rol
            u.email = email
            u.password_hash = get_password_hash(password)
            u.is_admin = True
            db.commit()
            print("[create_admin] Admin ACTUALIZADO:", username, email)
        else:
            u = Usuario(
                username=username,
                email=email,
                password_hash=get_password_hash(password),
                is_admin=True,
            )
            db.add(u)
            db.commit()
            print("[create_admin] Admin CREADO:", username, email)
if __name__ == "__main__":
    try:
        run()
        print("[create_admin] OK")
    except Exception as e:
        print("[create_admin] ERROR:", e)