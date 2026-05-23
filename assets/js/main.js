/* =========================================================
   1. IMPORTACIONES (Traemos solo los jefes de sección)
========================================================= */
import { obtenerDatos } from "./modules/api.js";
import { cargarComponentes, mostrarCategorias, mostrarMasVisitados } from "./modules/ui.js";
import { cargarSeccionProductos, cargarSeccionDetalle } from "./modules/productos.js";
import { actualizarContadorNav } from "./modules/nav.js";
import { renderizarCarrito } from "./modules/pagCarrito.js";

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
   3. CONTROL DE EJECUCIÓN (El "Enrutador" inteligente)
========================================================= */
// Se ejecuta siempre
prepararPaginaComun();

// Si estamos en la Home
document.addEventListener('DOMContentLoaded', inicializarPagina);

// Si estamos en el Catálogo, llamamos a su módulo correspondiente
if (document.getElementById('container-productos')) {
    cargarSeccionProductos();
}

// Si estamos en el Detalle, llamamos a su módulo correspondiente
if (document.getElementById('contenedor-detalle')) {
    cargarSeccionDetalle();
}

// 5. Si estamos en la página de la cesta de la compra
if (document.querySelector('.productos-carrito')) {
    renderizarCarrito();
}