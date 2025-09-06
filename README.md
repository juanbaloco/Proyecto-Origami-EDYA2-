Juan José Baloco Sánchez 
David Astudillo palma 
santiago vivas amaya

Link del repositorio:

 https://github.com/juanbaloco/Proyecto-Origami-EDYA2- 

1)
Problema. Personas y negocios quieren figuras de origami 3D pero no encuentran un catálogo claro ni un proceso sencillo para pedir o personalizar. Solución. Una SPA (React) con catálogo y pedidos, y un backend FastAPI con gestión de clientes y pedidos. Para quién. Clientes finales (regalos/decoración), comercios (volumen/branding) y taller (gestión interna).
Usuarios & 5 casos de uso

Cliente: Navegar catálogo y ver detalles de producto.
Cliente: Realizar un pedido estándar (checkout).
Cliente: Realizar pedido personalizado (formulario).
Cliente: Realizar un pedido de un producto no disponible (formulario).
Cliente: visualizar un carrito de compra, agregar o eliminar productos.
Cliente: Consultar el estado del pedido (revisión, elaborando, terminado, despachado).
Cliente: Opción de fidelización al completar un pedido, registrarse en un programa de beneficios con información adicional (nombre completo, correo, redes sociales, fecha de nacimiento), para acceder a:
Tutoriales exclusivos de origami
Acumulación de puntos por compras
Regalos por cierto tiempo en la comunidad.
Administrador:
Gestionar catálogo de productos:
	Crear, actualizar, eliminar productos e imágenes.
Visualizar pedidos realizados:
	Revisar pedidos estándar, personalizados y de productos no disponibles.
Gestionar estado de pedidos:
Actualizar estados: revisión → elaboración → terminado → despachado.
Consultar clientes fidelizados:
	Acceder a la lista de usuarios fidelizados y sus datos para gestionar beneficios.

Objetivos (MVP)
Catálogo con filtros y detalle de productos.
CRUD de producto.
Creación de pedidos estándar y personalizados.
Gestión de pedidos con estados visibles
Gestión de clientes fidelizados
Carrito de compra dinámico
Módulo de fidelización de clientes con beneficios 
No‑objetivos (por ahora)
Pasarelas de pago reales.
Logística en tiempo real.

2)
Historias de usuario

Como cliente, quiero explorar el catálogo de productos, para elegir figuras.
Criterio de aceptación: Al entrar al catálogo, se listan productos con nombre, descripción, imagen y precio.
Como cliente, quiero solicitar un pedido estándar con productos seleccionados, para simular una compra.
Criterio de aceptación: Al confirmar, se genera pedido con estado “pendiente”.
Como cliente, quiero solicitar un pedido personalizado, para tener un diseño único.
Criterio de aceptación: Al enviar formulario válido, se genera registro con estado “solicitado”.
Como cliente fidelizado, quiero registrar mis datos personales para recibir beneficios exclusivos.
Criterio de aceptación: Formulario completo habilita beneficios en la plataforma.
Como administrador, quiero gestionar estados de pedidos, para mantener informados a los clientes.
Como administrador, quiero crear y editar productos, para mantener actualizado el catálogo.
Criterio de aceptación: Al guardar un producto válido, aparece en el catálogo.
Mapa de versiones
Semana 11 (MVP): Registro de clientes, CRUD de productos, pedidos estándar, pedidos personalizados.
Semana 16 (Final): Historial de pedidos, filtros avanzados, wishlist, exportar CSV, autenticación básica admin.


3)

Pydantic entidad principal:
 
ProductoCreate lo usarías para crear un producto (request de POST).
Producto es lo que la API devuelve (response de GET/POST).


4)
DISEÑO API REST:  
Base URL Backend (FastAPI): http://127.0.0.1:8000/api
Formato de intercambio JSON
Paginación offset, limit
Ordenamiento: sort, order (as|desc)
Códigos de respuesta estándar:
200 OK → Respuesta exitosa
201 Created → Recurso creado
204 No Content → Eliminación exitosa
400 Bad Request → Solicitud inválida
404 Not Found → Recurso inexistente
409 Conflict → Duplicado en fidelización/producto
422 Unprocessable Entity → Error de validación
	
Productos:
Método
Ruta
Body/Query
Respuestas
Notas
GET
/productos
q, categoría, sort, order. offset, limit
200 (lista)
x-Total-Count
Lista de productos con filtros y paginación
GET
/productos{id}
—--
200, 404
Detalle de un producto
POST
/productos
{nombre, descripcion, precio, categoria_id, imagen_url}
201 422, 409
Crear producto (solo admin)
PUT
/productos/{id}
{...}(atributos editables)
200, 404, 422
Actualizar producto
DELETE
/productos/{id}
—
204, 404
Eliminar producto(solo admin)

Pedidos 

GET
/pedidos
estado, offset, limit 
200
Listar pedidos


GET
/pedidos/{id}
—
200,404
Detalle de un pedido
POST
/pedidos
{contacto: {nombre, correo, telefono}, items: [{producto_id, cantidad}]}
201, 422
Crear pedido estandar
POST
/pedidos/personalizado
{contacto : {nombre, correo, teléfono}, descripción, imagen_referencia}
201,422
Pedido personalizado 
PUT
/pedidos/{id}/estado
{estado}
200,404,422
Cambiar estado (admin)
DELETE
/pedidos/{id}
—
204, 404
Cancelar pedido 


Ejemplo POST/ pedidos

Carrito
En frontend, pero se persiste en backend para seguimiento:

GET
/carrito/{session_id}
—
200
Contenido del carrito
POST
/carrrito/{session_id}
{producto_id, cantidad}
201


PUT
/carrito{session_id}/{item_id}
{cantidad}
200


DELETE
/carrito/{session_id}/{item_id}
—
204



Fidelización:

POST
/fidelización
{correo, nombre_completo, fecha_nacimiento, redes?, dirección}
201,422
Registro en programa de fidelizacion
GET
/fidelizacion/{correo}
—
200,404
Ver perfil fidelizado
PUT
/fidelizacion/{correo}
{...}
200,404,422
Actualizar datos
GET
/fidelizacion/{correo}/beneficios
—
200
Ver puntos, tutoriales y regalos

Ejemplo POST/ fidelizacion

Respuesta


