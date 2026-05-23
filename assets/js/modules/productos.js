import { obtenerDatos } from "./api.js";
import { mostrarProductos, mostrarDetalle } from "./ui.js";
import { agregarAlCarrito } from "./carrito.js";

// 📦 MÓDULO: Cargar el catálogo completo de productos
export async function cargarSeccionProductos() {
    try {
        const datos = await obtenerDatos('../data/db.json');
        const parametros = new URLSearchParams(window.location.search);
        const categoriaSeleccionada = parametros.get('categoria');

        const productosMostrar = categoriaSeleccionada
            ? datos.productos.filter(p => p.categoria === categoriaSeleccionada)
            : datos.productos;

        mostrarProductos(productosMostrar, 'container-productos');

        // Escucha de botones para añadir a la cesta
        const botonesComprar = document.querySelectorAll('.btn-comprar');
        botonesComprar.forEach(boton => {              
            boton.addEventListener('click', (evento) => {
                evento.preventDefault();  
                evento.stopPropagation(); 
                        
                const id = evento.target.dataset.id;
                const nombre = evento.target.dataset.label;
                const precio = evento.target.dataset.price;
                const imagen = evento.target.dataset.image;

                agregarAlCarrito(id, nombre, precio, imagen);
            });                
        });
        
    } catch (error) {
        console.error("No puedo cargar los productos:", error);
    }
}

// 📦 MÓDULO: Cargar la pantalla de detalle de un producto
export async function cargarSeccionDetalle() {
    try {
        const datos = await obtenerDatos('../data/db.json');
        const parametros = new URLSearchParams(window.location.search);
        const idBuscado = parametros.get('id');

        const productoEncontrado = datos.productos.find(p => p.id == idBuscado);

        if (!productoEncontrado) {
            document.getElementById('contenedor-detalle').innerHTML = '<p style="text-align:center;margin-top:40px;color:#777;">Producto no encontrado</p>';
            return;
        }

        mostrarDetalle(productoEncontrado, 'contenedor-detalle');

        const botonComprar = document.querySelector('.btn-comprar');
        if (botonComprar) { 
            botonComprar.addEventListener('click', (evento) => {
                evento.preventDefault();
                evento.stopPropagation();

                const id = evento.target.dataset.id;
                const nombre = evento.target.dataset.label;
                const precio = evento.target.dataset.price;
                const imagen = evento.target.dataset.image;

                agregarAlCarrito(id, nombre, precio, imagen);
            });
        }        
    } catch (error) {
        console.error("Error al cargar el detalle:", error);
    }
}