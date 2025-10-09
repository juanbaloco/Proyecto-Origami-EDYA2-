README FILE ENTREGA 2

En esta segunda entrega se consolidó la funcionalidad del aplicativo OrigamiApp, integrando la API REST con una base de datos real en SQLITE.
Se implementaron modelos ORM completos, conexión a FastAPI mediante dependencias, autenticación de usuarios y persistencia de datos en los módulos de productos, pedidos, fidelización, usuario y carrito de compras.


Cambios generales:

<img width="505" height="329" alt="image" src="https://github.com/user-attachments/assets/e2985d8f-ab95-4e62-864c-d98da9362a5c" />


Cambios en endpoints:

<img width="494" height="304" alt="image" src="https://github.com/user-attachments/assets/941d87eb-6829-4d90-8620-80237e31bf68" />



BASE DE DATOS Y CREACIÓN DE MODELS
  
Objetivos implementados

- Configuración de conexión a base de datos SQLite
- Creación de modelos SQLAlchemy para todas las entidades
- Definición de relaciones entre tablas
- Implementación de índices para optimización de consultas
- Integración con FastAPI mediante dependencias

Objetivos pendientes
- Añadir sistema de puntos y recompensas dinámico para fidelización.

- Incluir pruebas unitarias automatizadas para endpoints críticos.


Estructura de archivos creados

Backend/

├── app/

│   ├── db/                          # Configuración de base de datos 

│   │   ├── __init__.py             # Exporta componentes principales 

│   │   └── database.py             # Conexión y sesión de BD 

│   │ 

│   └── models/                      # Modelos SQLAlchemy (ORM) 

│       ├── __init__.py             # Exporta todos los modelos 

│       ├── usuario.py              # Modelo de usuarios 

│       ├── categoria.py            # Modelo de categorías 

│       ├── producto.py             # Modelo de productos 

│       ├── carrito.py              # Modelos de carrito de compras 

│       ├── pedido.py               # Modelos de pedidos 

│       └── fidelizacion.py         # Modelo de fidelización 

│ 

└── bd/ 

    └── BDproyectoorigami.db        # Base de datos SQLite 
    

Estructura de archivos modificados: 

Backend/ 

├──app/ 


│   ├──Schemas/ 

│       ├──__init__    #exporta todos los esquemas 

│       ├── auth.py  # nueva entidad encargada de la autenticación de usuario 

│       ├── carrito.py	# entidad donde se encuentra la lista y paginación de productos agregados 

│       ├── categoria.py   #Nueva entidad donde se representan las categorías de origami 

│       ├── fidelizacion.py #ajustes de endpoint para que los datos persistan en base de datos 

│       ├── pedido.py  #ajustes de endpoint para que los datos persistan en base de datos 

│       ├── producto.py #ajustes de endpoint para que los datos persistan en base de datos 

│       ├── token.py #token para el inicio de sección en usuario  

│       └── usuario.py #nueva entidad encargada de los datos del usuario y administrador 

│

│


Configuración de Conexión (app/db/database.py)

Características principales:

- Motor de BD: SQLite con soporte para conexiones concurrentes
- 
- Sesión: SessionLocal para manejo de transacciones
  
- Base declarativa: Para definición de modelos ORM
  
- Dependencia FastAPI: Función get_db() para inyección de sesiones
  
Modelos Implementados

1. Usuario (usuario.py)
  Gestión de usuarios del sistema (clientes y administrador).
  Campos:
    id (Integer, PK, autoincremental)
    username (String, único, indexado)
    email (String, único, indexado)
    hashed_password (String)
    is_admin (Boolean, default: False)
2. Categoria (categoria.py)
  Categorías de productos de origami.
  Campos:
    slug (String, PK, indexado)
    nombre (String)
  Relaciones:
  productos: One-to-Many con Producto
3. Producto (producto.py)
  Catálogo de figuras de origami disponibles.
  Campos:
    id (String, PK - UniqueID)
    sku (String, único)
    nombre (String, máx 80 caracteres)
    descripcion (Text, opcional)
    slug (String, indexado)
    precio (Float)
    color, tamano, material (String, opcionales)
    imagen_url (String, opcional)
    activo (Boolean, default: True)
    categoria_slug (FK a Categoria)
  Relaciones:
    categoria: Many-to-One con Categoria
    items_carrito: One-to-Many con ItemCarrito
    items_pedido: One-to-Many con PedidoItem
4. Carrito y ItemCarrito (carrito.py)
  Gestión de carritos de compra temporales.
  Carrito:
    session_id (String, PK)
    ItemCarrito:
    session_id (FK a Carrito, PK)
    producto_id (FK a Producto, PK, indexado)
    cantidad (Integer)
  Relaciones:
    Carrito: One-to-Many con ItemCarrito (cascade delete)
    ItemCarrito: Many-to-One con Producto
5. Pedido y PedidoItem (pedido.py)
  Gestión de pedidos realizados.
  Pedido:
    id (String, PK - UniqueID)
    estado (String, default: "pendiente")
    contacto_nombre (String)
    contacto_email (String)
    contacto_telefono (String, opcional)
  PedidoItem:
    pedido_id (FK a Pedido, PK)
    producto_id (FK a Producto, PK, indexado)
    cantidad (Integer)
  Relaciones:
    Pedido: One-to-Many con PedidoItem (cascade delete)
    PedidoItem: Many-to-One con Producto
6. Fidelizacion (fidelizacion.py)
  Sistema de fidelización de clientes.
  Campos:
    id (Integer, PK, autoincremental)
    correo (String, único, indexado)
    nombre_completo (String)
    fecha_nacimiento (String)
    redes (JSON, lista de redes sociales)
    direccion (String, opcional)
    puntos (Integer, default: 0)
    tutoriales (JSON, lista de tutoriales)
    proximo_regalo (String, opcional)
Integración con FastAPI
  En main.py:
  from app.db.database import engine, Base
  from app.models import *

  # Crear todas las tablas al iniciar la aplicación
  Base.metadata.create_all(bind=engine)

  Uso en endpoints:
  from app.db.database import get_db
  from sqlalchemy.orm import Session
  from fastapi import Depends

  @router.get("/productos")
  def listar_productos(db: Session = Depends(get_db)):
    productos = db.query(Producto).all()
    return productos
  Índices Implementados
    Para optimizar consultas frecuentes:
    Usuario: username, email
    Categoria: slug
    Producto: slug, categoria_slug
    ItemCarrito: producto_id
    PedidoItem: producto_id
    Fidelizacion: correo
    Dependencias Necesarias
    sqlalchemy==2.0.23 
    Instalación: pip install sqlalchemy

Con entorno encendido: 

.\.venv\Scripts\python.exe -m pip install sqlalchemy


python -m ensurepip --upgrade

python -m pip install --upgrade pip

python -m pip install fastapi uvicorn sqlalchemy pydantic


python -m pip install python-jose

pip install python-jose[cryptography]==3.3.0

pip install --upgrade "passlib==1.7.4" "python-jose[cryptography]==3.3.0"

python -m pip install passlib[bcrypt]

.\.venv\Scripts\python.exe -m pip install python-multipart

Pruebas de Conexión
  Se creó un script de prueba (test_db.py) para verificar:
    Conexión exitosa a la base de datos
    Importación correcta de todos los modelos
    Ejecución de consultas
    Verificación de tablas existentes
Ejecutar pruebas:

cd Backend

python app/test_db.py

Diagrama de Relaciones

Usuario
   (independiente)
   


Categoria ──< Producto >── ItemCarrito >── Carrito
                │
                └──< PedidoItem >── Pedido

Fidelizacion
   (independiente)

Leyenda:
──<: One-to-Many
>──: Many-to-One

Ejecucion del backend:

# Crear entorno virtual
python -m venv .venv
.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn app.main:app --reload --port 8000


Desarrollado por:
Juan  Baloco
Santiago Vivas
David Astudillo
