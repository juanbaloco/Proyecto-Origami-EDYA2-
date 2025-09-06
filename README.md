# Proyecto-Origami-EDYA2-

+-----------------------------+           JSON + CORS           +-----------------------------+
|     Frontend (React + Vite)|  <----------------------------> |        Backend (FastAPI)    |
|-----------------------------|                                 |-----------------------------|
| Rutas:                      |                                 | Endpoints REST:             |
|  - /catalogo                |                                 |  - /productos               |
|  - /carrito                 |                                 |  - /clientes                |
|  - /pedidos                 |                                 |  - /pedidos                 |
|  - /perfil                  |                                 |  - /fidelizacion            |
|  - /fidelizacion            |                                 |                             |
+-----------------------------+                                 +-----------------------------+
                                                                      |
                                                                      |
                                                                      v
                                                        +-----------------------------+
                                                        |     Base de Datos SQL       |
                                                        |-----------------------------|
                                                        | Tablas normalizadas:        |
                                                        |  - Producto                 |
                                                        |  - Cliente                  |
                                                        |  - Pedido                   |
                                                        |  - Fidelización             |
                                                        +-----------------------------+
