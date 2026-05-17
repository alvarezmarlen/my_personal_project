/* =========================================================
   1. IMPORTACIONES
========================================================= */
import { obtenerDatos } from "./modules/api.js";
import { cargarComponentes, mostrarCategorias, mostrarMasVisitados, mostrarProductos, mostrarDetalle } from "./modules/ui.js";
import { agregarAlCarrito } from "./modules/carrito.js"


/* =========================================================
   2. DECLARACIÓN DE FUNCIONES (Las recetas)
========================================================= */
// Componentes comunes (Nav y Footer)
async function prepararPaginaComun() {
        await cargarComponentes('nav-placeholder', '../assets/componentes/nav.html');
        await cargarComponentes('footer-placeholder', '../assets/componentes/footer.html');
    }


// Datos de la página de Inicio (Categorías y Favoritos)
async function inicializarPagina() {
    const datos = await obtenerDatos('../data/db.json');   // 1. Llamamos al JSON
    if (datos) {
        // 1. Esto ya lo tienes para el mosaico
        if (datos.mosaico) {
            mostrarCategorias(datos.mosaico, 'categoria-container');
        }
        // 2. AQUÍ es donde conectamos los favoritos
        if (datos.productos) {             
            mostrarMasVisitados(datos.productos, 'favoritos-container'); // Llamamos a tu nueva función de ui.js
        }
    }
}

// Sección de Catálogo de Productos
async function cargarSeccionProductos() {
        try {
            const datos = await obtenerDatos('../data/db.json');
           // 1. Detectar si hay una categoría específica en la URL 
            const parametros = new URLSearchParams(window.location.search);
            const categoriaSeleccionada = parametros.get('categoria');

            // 2. Filtrar el array si existe el parámetro; si no, mostrar todos
            const productosMostrar = categoriaSeleccionada
                ? datos.productos.filter(p => p.categoria === categoriaSeleccionada)
                : datos.productos;

            // 3. Pintar en pantalla el resultado final
            mostrarProductos(productosMostrar, 'container-productos');

            //ESCUCHA LOS BOTONES : Añadir a la cesta
            // Seleccionamos todos los botones de la pantalla
            const botonesComprar = document.querySelectorAll('.btn-comprar');
            
            botonesComprar.forEach(boton => {    // Recorremos cada botón uno por uno              
                boton.addEventListener('click', (evento) => {
                        // 🎯 ¡LA LÍNEA MÁGICA! Evita que el clic "suba" al enlace <a>
                        evento.preventDefault();  // 🛑 Frena la navegación del enlace <a>
                        evento.stopPropagation(); // 🛑 Evita que el clic suba a la tarjeta entera
                            
                        // Capturamos los datos de atributos data-
                        const id = evento.target.dataset.id;
                        const nombre = evento.target.dataset.label;
                        const precio = evento.target.dataset.price;
                            
                        // 2. 🚀 Enviamos los datos al otro archivo
                        agregarAlCarrito(id, nombre, precio);
                });                
            });
            
        } catch (error) {
            console.error("No puedo cargar los productos:", error);
        }
    }


// Sección de Detalle de Producto
async function cargarSeccionDetalle() {
    try {
        const datos = await obtenerDatos('../data/db.json');
        // 1. Capturamos el ID de la URL (por ejemplo: detalle.html?id=9)
        const parametros = new URLSearchParams(window.location.search);
        const idBuscado = parametros.get('id');

        // 2. Buscamos el producto único que coincida con ese ID
        const productoEncontrado = datos.productos.find(p => p.id == idBuscado);

        // 3. Lo pintamos en la pantalla usando la función de ui.js
        mostrarDetalle(productoEncontrado, 'contenedor-detalle');

        // Seleccionamos el único botón de comprar que se acaba de pintar
        const botonComprar = document.querySelector('.btn-comprar');
        // 5. Escuchamos el clic en ese botón
        if (botonComprar) { 
            botonComprar.addEventListener('click', (evento) => {
                evento.preventDefault();
                evento.stopPropagation();

                // Capturamos los datos desde los atributos data- del botón
                const id = evento.target.dataset.id;
                const nombre = evento.target.dataset.label;
                const precio = evento.target.dataset.price;

                // Enviamos el producto al carrito
                agregarAlCarrito(id, nombre, precio);
            });
        }        
    } catch (error) {
        console.error("Error al cargar el detalle:", error);
    }
}


/* =========================================================
   3. CONTROL DE EJECUCIÓN (¿Qué se activa en cada página?)
========================================================= */
// 1. Esto se ejecuta siempre en cualquier página para cargar Nav/Footer
prepararPaginaComun();

// 2. Si estamos en la página de inicio (con contenedores de categorías)
document.addEventListener('DOMContentLoaded', inicializarPagina);

// 3. Si estamos en la página de catálogo de productos
if (document.getElementById('container-productos')) {
        cargarSeccionProductos();
    }

// 4. Si estamos en la página de detalle de producto
if (document.getElementById('contenedor-detalle')) {
    cargarSeccionDetalle();
}