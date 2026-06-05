# Store Sumi.chh — Frontend

Tienda virtual de bisutería artesanal construida con JavaScript vanilla (ES Modules) que se conecta a una API REST Flask para todas las operaciones: catálogo, autenticación, carrito, pedidos y administración.

## Tecnologías utilizadas

| Tecnología | Propósito |
|---|---|
| **HTML5** | Estructura semántica de las páginas |
| **CSS3** | Diseño responsive, animaciones, grid y flexbox |
| **JavaScript (ES Modules)** | Lógica de negocio del lado del cliente |
| **Boxicons + Font Awesome** | Iconografía |
| **Asistente IA** | opencode/big-pickle — generación y revisión de código |

## Autor

**Marlen Alvarez** — [https://github.com/alvarezmarlen](https://github.com/alvarezmarlen)

## Estructura del proyecto

```
my_personal_project/
├── index.html                         # Página de inicio
├── assets/
│   ├── css/
│   │   ├── style.css                  # Home: banner, mosaico, favoritos
│   │   ├── nav.css                    # Barra de navegación
│   │   ├── footer.css                 # Pie de página
│   │   ├── admin.css                  # Panel de administración
│   │   ├── carrito.css                # Carrito y checkout
│   │   ├── contacto.css               # Formulario de contacto
│   │   ├── cuenta.css                 # Perfil e historial
│   │   ├── detalle.css                # Detalle de producto
│   │   ├── login.css                  # Login y registro
│   │   ├── nosotros.css               # Página sobre nosotros
│   │   └── productos.css              # Catálogo y filtros
│   ├── componentes/
│   │   ├── nav.html                   # Menú reutilizable
│   │   └── footer.html                # Footer reutilizable
│   ├── img/                           # Imágenes del catálogo
│   └── js/
│       ├── main.js                    # Router: decide qué módulo cargar
│       └── modules/
│           ├── api.js                 # Cliente HTTP centralizado
│           ├── auth.js                # Login, registro, JWT, sesión
│           ├── cartState.js           # Estado del carrito (híbrido)
│           ├── carrito.js             # Agregar/quitar del carrito
│           ├── pagCarrito.js          # Página carrito + checkout
│           ├── productos.js           # Catálogo y filtros
│           ├── ui.js                  # Renderizado de componentes
│           ├── nav.js                 # Nav: contador, sesión, búsqueda
│           ├── banner.js              # Animación del banner
│           ├── contacto.js            # Formulario de contacto
│           ├── cuenta.js              # Perfil e historial
│           ├── admin.js               # Panel admin (orquestador)
│           ├── admin-productos.js     # CRUD productos
│           ├── admin-categorias.js    # CRUD categorías
│           ├── admin-usuarios.js      # CRUD usuarios
│           └── admin-pedidos.js       # Listado de pedidos
└── pages/
    ├── admin.html                     # Panel de administración
    ├── carrito.html                   # Carrito y checkout
    ├── contacto.html                  # Formulario de contacto
    ├── cuenta.html                    # Perfil y pedidos
    ├── detalle.html                   # Detalle de producto
    ├── login.html                     # Inicio de sesión
    ├── nosotros.html                  # Sobre nosotros
    ├── productos.html                 # Catálogo con filtros
    ├── registro.html                  # Registro de usuarios
    └── 404.html                       # Página no encontrada
```

## Cómo levantar el proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/alvarezmarlen/store-sumi.git
cd store-sumi/my_personal_project

# 2. Servir con cualquier servidor estático
#    Opción A — Live Server (VSCode): botón derecho sobre index.html → "Open with Live Server"
#    Opción B — Python:
python -m http.server 8000
#    Opción C — Node:
npx serve .

# 3. Asegurar que el backend esté corriendo en localhost:{puerto_del_backend}
```

## Arquitectura

### Patrón modular

Toda la lógica está organizada en módulos ES6 que se importan según la página:

```
main.js (router)
  ├── index.html     → banner.js, ui.js, nav.js
  ├── productos.html → productos.js, ui.js, nav.js
  ├── detalle.html   → productos.js, ui.js, nav.js
  ├── carrito.html   → pagCarrito.js, cartState.js, nav.js
  ├── login.html     → auth.js, nav.js
  ├── registro.html  → auth.js, nav.js
  ├── contacto.html  → contacto.js, nav.js
  ├── cuenta.html    → cuenta.js, nav.js
  └── admin.html     → admin.js + admin-*.js, nav.js
```

### Comunicación con el backend

`api.js` es el **cliente HTTP centralizado**. Todos los módulos importan `api` y llaman a sus métodos:

```javascript
import { api } from "./api.js";

// Ejemplo: obtener productos
const productos = await api.getProductos({ categoria: 1 });

// Ejemplo: iniciar sesión
const res = await api.login({ email, password });
```

- Inyecta automáticamente el token JWT en los headers
- Maneja errores 401 mostrando un modal de "Sesión expirada"
- `API_BASE` apunta a `http://localhost:5000/api` (cambiar en producción)

### Carrito híbrido

| Estado | Almacenamiento | Comportamiento |
|---|---|---|
| Usuario anónimo | `localStorage` | El carrito se guarda localmente |
| Usuario logueado | Servidor (BD) | El carrito se migra automáticamente al servidor al iniciar sesión |

### Panel de administración

El dashboard (`admin.html`) tiene 4 pestañas con CRUD completo:

- **Productos**: tabla con editar/eliminar, modal con campos, subida de imágenes
- **Categorías**: tabla con editar/eliminar, modal simple
- **Usuarios**: tabla con editar/eliminar/reset password, modal con checkbox de admin
- **Pedidos**: listado read-only con detalle de artículos

## Páginas y funcionalidades

| Página | Funcionalidad |
|---|---|
| **Home** | Banner animado, mosaico de categorías, productos favoritos |
| **Productos** | Catálogo completo con filtros por categoría y buscador |
| **Detalle** | Información completa del producto, botón de añadir al carrito |
| **Carrito** | Lista de productos, ajuste de cantidades, checkout con modal de pago |
| **Login / Registro** | Autenticación JWT, recuperación de contraseña |
| **Contacto** | Formulario de contacto almacenado en la base de datos |
| **Cuenta** | Perfil del usuario e historial de pedidos |
| **Admin** | Gestión de productos, categorías, usuarios y pedidos |

## Producción

Antes de desplegar:

1. Abrir `assets/js/modules/api.js`
2. Cambiar `API_BASE` de `http://localhost:5000/api` a la URL del backend en producción
