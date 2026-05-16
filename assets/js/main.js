
import { obtenerDatos } from "./modules/api.js";
import { cargarComponentes, mostrarCategorias, mostrarMasVisitados, mostrarProductos } from "./modules/ui.js";



async function prepararPaginaComun() {
// 1. Cargamos el Nav y el Footer EN TODAS LAS PAGINAS
        await cargarComponentes('nav-placeholder', '../assets/componentes/nav.html');
        await cargarComponentes('footer-placeholder', '../assets/componentes/footer.html');
    }
prepararPaginaComun();



// 2. CARGAMOS las CATEGORIAS Y FAVORITOS desde db.json
async function inicializarPagina() {
    // 1. Llamamos al JSON
    const datos = await obtenerDatos('../data/db.json'); 

if (datos) {
        // 1. Esto ya lo tienes para el mosaico
        if (datos.mosaico) {
            mostrarCategorias(datos.mosaico, 'categoria-container');
        }

        // 2. AQUÍ es donde conectamos los favoritos
        if (datos.productos) {
            // Llamamos a tu nueva función de ui.js
            mostrarMasVisitados(datos.productos, 'favoritos-container'); 
        }
    }
}
// Ejecutar cuando cargue la web
document.addEventListener('DOMContentLoaded', inicializarPagina);


// 3. Cargamos los productos desde db.json  ESTA FUNCION SOLO se ejecuta si estamos en la página de productos
async function cargarSeccionProductos() {
        try {
            const datos = await obtenerDatos('../data/db.json');

            // 1. Detectar si hay una categoría específica en la URL 🔍
            const parametros = new URLSearchParams(window.location.search);
            const categoriaSeleccionada = parametros.get('categoria');

            // 2. Filtrar el array si existe el parámetro; si no, mostrar todos
            const productosMostrar = categoriaSeleccionada
                ? datos.productos.filter(p => p.categoria === categoriaSeleccionada)
                : datos.productos;

            // 3. Pintar en pantalla el resultado final
            mostrarProductos(productosMostrar, 'container-productos');
        } catch (error) {
            console.error("No puedo cargar los productos:", error);
        }
    }
    if (document.getElementById('container-productos')) {
        cargarSeccionProductos();
    }