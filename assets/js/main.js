/* =========================================================
   1. IMPORTACIONES (Traemos solo los jefes de sección)
========================================================= */
import { obtenerDatos } from "./modules/api.js";
import { cargarComponentes, mostrarCategorias, mostrarMasVisitados } from "./modules/ui.js";
import { cargarSeccionProductos, cargarSeccionDetalle } from "./modules/productos.js";
import { actualizarContadorNav } from "./modules/nav.js";
import { renderizarCarrito } from "./modules/pagCarrito.js";
import { iniciarBanner } from "./modules/banner.js";

/* =========================================================
   2. FUNCIONES DE PÁGINA COMÚN E INICIO
========================================================= */
// Carga Nav y Footer en toda la web
async function prepararPaginaComun() {
    await cargarComponentes('nav-placeholder', '../assets/componentes/nav.html');
    await cargarComponentes('footer-placeholder', '../assets/componentes/footer.html');

    // 🌟 Llamamos al contador una vez que el HTML del Nav ya se ha incrustado
    actualizarContadorNav();
}

// Carga las categorías y favoritos del Inicio
async function inicializarPagina() {
    const datos = await obtenerDatos('../data/db.json');   
    if (datos) {
        if (datos.mosaico) mostrarCategorias(datos.mosaico, 'categoria-container');
        if (datos.productos) mostrarMasVisitados(datos.productos, 'favoritos-container');
    }
}

/* =========================================================
   3. CONTROL DE EJECUCIÓN (Enrutador por URL)
========================================================= */
prepararPaginaComun();

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
}