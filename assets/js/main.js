/* =========================================================
   1. IMPORTACIONES (Traemos solo los jefes de sección)
========================================================= */
import { api } from "./modules/api.js";
import { cargarComponentes, mostrarCategorias, mostrarMasVisitados, inicializarVolverArriba } from "./modules/ui.js";
import { cargarSeccionProductos, cargarSeccionDetalle } from "./modules/productos.js";
import { actualizarContadorNav, actualizarNavSesion, inicializarBusqueda, inicializarEnlacesPendientes } from "./modules/nav.js";
import { renderizarCarrito } from "./modules/pagCarrito.js";
import { iniciarBanner } from "./modules/banner.js";
import { inicializarLogin, inicializarRegistro, inicializarOlvidePassword } from "./modules/auth.js";
import { inicializarContacto } from "./modules/contacto.js";
import { inicializarCuenta } from "./modules/cuenta.js";

/* =========================================================
   2. FUNCIONES DE PÁGINA COMÚN E INICIO
========================================================= */
// Carga Nav y Footer en toda la web
async function prepararPaginaComun() {
    await cargarComponentes('nav-placeholder', '../assets/componentes/nav.html');
    await cargarComponentes('footer-placeholder', '../assets/componentes/footer.html');

    // 🌟 Llamamos al contador una vez que el HTML del Nav ya se ha incrustado
    await actualizarContadorNav();
}

// Carga las categorías y favoritos del Inicio
async function inicializarPagina() {
    try {
        // Pedimos los datos reales al backend usando la nueva API
        const productos = await api.getProductos();
        const categorias = await api.getCategorias();   

        // Si tenemos categorías desde el backend, las mostramos en el mosaico
        if (categorias) {
            mostrarCategorias(categorias, 'categoria-container');
        }
        
        // Si tenemos productos, mostramos los primeros en la sección de favoritos/más visitados
        if (productos) {
            mostrarMasVisitados(productos, 'favoritos-container');
        }
    } catch (error) {
        console.error("Error al cargar la página de inicio desde la API:", error);
    }
}

/* =========================================================
   3. CONTROL DE EJECUCIÓN (Enrutador por URL)
========================================================= */
prepararPaginaComun().then(async () => {
    await actualizarContadorNav();
    actualizarNavSesion();
    inicializarBusqueda();
    inicializarEnlacesPendientes();
    inicializarVolverArriba();
});

const pagina = window.location.pathname.split('/').pop() || 'index.html';

if (pagina === 'index.html') {
    document.addEventListener('DOMContentLoaded', () => {
        inicializarPagina();
        iniciarBanner();
    });
} else if (pagina === 'productos.html') {
    cargarSeccionProductos();
} else if (pagina === 'detalle.html') {
    cargarSeccionDetalle();
} else if (pagina === 'carrito.html') {
    renderizarCarrito();
} else if (pagina === 'login.html') {
    inicializarLogin();
    inicializarOlvidePassword();
} else if (pagina === 'registro.html') {
    inicializarRegistro();
} else if (pagina === 'contacto.html') {
    inicializarContacto();
} else if (pagina === 'cuenta.html') {
    inicializarCuenta();
} else if (['nosotros.html', 'admin.html'].includes(pagina)) {
} else {
    const rutasValidas = ['index.html', 'productos.html', 'detalle.html', 'carrito.html', 'login.html', 'registro.html', 'contacto.html', 'cuenta.html', 'nosotros.html', 'admin.html'];
    if (!rutasValidas.includes(pagina)) {
        window.location.href = window.location.pathname.includes('/pages/') ? './404.html' : './pages/404.html';
    }
}