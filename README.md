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
