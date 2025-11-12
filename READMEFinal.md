
# Proyecto Origami - Estructuras de Datos y Algoritmos

---

# Resumen de la última entrega

Esta entrega se enfocó en cerrar pendientes funcionales y de calidad:

- JWT corregido: registro, login y persistencia de sesión funcionando; `admin` puede autenticarse correctamente.
- Gestión de productos por admin: creación, edición, activación/desactivación y carga de imágenes vía `/api/productos` (protección `require_admin`).
- Pedidos personalizados: endpoints y flujo en el Front para levantar pedidos de tipo `personalizado` (además de los estándar).
- Mejoras de UX: rutas protegidas (`ProtectedRoute`, `AdminRoute`), manejo de token en `localStorage`, feedback de errores y formularios más claros.
- Reglas de negocio de estados: no se permite cancelar pedidos entregados (validaciones de estado en endpoints de pedidos).
- Pequeñas optimizaciones: limpieza de dependencias, CORS afinado y responses consistentes.
- Pruebas básicas: script de verificación de base de datos (`Backend/app/test_db.py`) y endpoints de health check (`/health`).

> Backend principal en `Backend/app/main.py`. Frontend (Vite/React) en `frontend/`.

---

# Arquitectura (vista rápida)

En cuanto a la arquitectura del proyecto, se sigue trabajando con la que ya había sido presentada, sujeta a los cambios que se realizaron para tener el mejor funcionamiento del aplicativo.

- Backend: FastAPI + SQLAlchemy + SQLite (`Backend/app/db/BDproyectoorigami.db`), routers en `Backend/app/api/routes`.
- Frontend: React 19 + Vite 7. API configurada en `frontend/src/api.js` contra `http://localhost:8000/api`.
- Auth: `OAuth2PasswordBearer` (token en `Authorization: Bearer …`) y utilidades JWT en `Backend/app/core/security.py` con configuración en `Backend/app/core/config.py`.
- CORS: orígenes permitidos `http://localhost:5173` y `http://127.0.0.1:5173`.

---

# Detalles clave de autenticación JWT

- Generación/validación del token centralizada en `app/core/security.py` (algoritmo `HS256`, expiración desde `settings`).
- `get_current_user` y `require_admin` en `app/core/dependencies.py` protegen rutas y roles.
- Endpoints de autenticación en `app/api/routes/auth_routes.py`:
  - `POST /api/auth/register`
  - `POST /api/auth/login` (form `username` + `password` o JSON según cliente)
- El Front guarda el token con `setToken()` y lo añade a `fetch` en `src/api.js`.

---

# Requisitos

- Python 3.11+ (recomendado)
- Node.js 20+ (incluye `npm`)
- Windows, macOS o Linux


---

# Puesta en marcha (local)

> Orden sugerido: crear y activar entorno virtual, instalar dependencias del Backend, levantar Backend y luego el Frontend.

## 1) Backend (FastAPI)

Desde la carpeta `Backend/`:

```bash
# Crear entorno virtual
python -m venv .venv

# Activar (Windows)
.\.venv\Scripts\activate
# Activar (macOS/Linux)
# source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# (Recomendado) Variables de entorno
# Crear archivo .env en Backend/ con:
# SECRET_KEY="cambia_esta_clave_larga_y_unica_de_mas_de_32_caracteres"
# ALGORITHM="HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES=60

# Iniciar API (puerto 8000)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Comprobación rápida: abre `http://localhost:8000/health` → `{"status":"ok"}`  
Documentación interactiva: `http://localhost:8000/docs`

## 2) Frontend (Vite/React)

En otra terminal, desde `frontend/`:

```bash
# Instalar dependencias
npm install

# Iniciar dev server (puerto 5173)
npm run dev
```

Notas
- El Front consume la API en `http://localhost:8000/api` (ver `src/api.js`).
- CORS ya permite `http://localhost:5173`.
- Si cambias el puerto del backend, ajusta `API_BASE_URL` en `src/api.js`.

---

# Pruebas / verificación básica

```bash
# (opcional) Desde Backend/
python app/test_db.py  # Verifica conexión a SQLite y existencia del archivo de BD
```

Puedes agregar pruebas de endpoints usando `pytest` + `httpx` en una próxima iteración.

# Importante
Es importante tener en cuenta que el comando para poder ejecutar el test es: npm run test
de esta manera se correran las pruebas y se verificaran los aspectos a revisar.

---

# Endpoints principales (ejemplos)

- Auth: `/api/auth/register`, `/api/auth/login`
- Productos (admin): `/api/productos` (CRUD, subida de imágenes)
- Pedidos estándar/personalizados: `/api/pedidos/*`
- Carrito: `/api/carrito/*`
- Estados/Reglas: no cancelar pedidos con estado `entregado`

Explora todos en Swagger: `http://localhost:8000/docs`

---

# UX / Flujo en Frontend

- Rutas protegidas: `ProtectedRoute.jsx`, `AdminRoute.jsx`
- Gestión de sesión y token: `src/api.js`
- Páginas clave: `pages/LoginPage.jsx`, `pages/RegisterPage.jsx`, `pages/AdminDashboard.jsx`, `pages/ProductListPage.jsx`, `pages/CustomOrderPage.jsx`, `pages/OrdersPage.jsx`

---

# Troubleshooting rápido

- 401/403 al llamar APIs → Verifica token y rol admin.
- CORS bloqueado → Mantén el Front en `5173` o ajusta orígenes en `app/core/cors.py` / `config.py`.
- DB no responde → Asegura que existe `Backend/app/db/BDproyectoorigami.db` (se crea al iniciar si faltan tablas).
- Imágenes → Carpeta `uploads/` se crea automáticamente; revisa permisos.

---

Autores: 
Juan José Baloco, David Astudillo, Santiago Vivas




---

- redaccion del readme file apoyada con chatgpt
