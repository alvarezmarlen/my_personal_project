import { obtenerDatos } from "./api.js";
import { mostrarProductos, mostrarDetalle } from "./ui.js";
import { agregarAlCarrito } from "./carrito.js";

function reasignarBotones() {
    document.querySelectorAll('.btn-comprar').forEach(boton => {
        boton.addEventListener('click', (evento) => {
            evento.preventDefault();
            evento.stopPropagation();
            agregarAlCarrito(
                evento.target.dataset.id,
                evento.target.dataset.label,
                evento.target.dataset.price,
                evento.target.dataset.image
            );
        });
    });
}

function aplicarFiltros(productos) {
    const selectCat = document.getElementById('filtro-categoria');
    const selectOrd = document.getElementById('filtro-orden');
    let resultado = [...productos];

    if (selectCat && selectCat.value) {
        resultado = resultado.filter(p => p.categoria === selectCat.value);
    }

    if (selectOrd && selectOrd.value) {
        const [campo, dir] = selectOrd.value.split('-');
        resultado.sort((a, b) => {
            let va = a[campo], vb = b[campo];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return dir === 'asc' ? -1 : 1;
            if (va > vb) return dir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return resultado;
}

function inicializarFiltros(datos, productosIniciales) {
    const selectCat = document.getElementById('filtro-categoria');
    const selectOrd = document.getElementById('filtro-orden');
    if (!selectCat) return;

    const categorias = [...new Set(datos.productos.map(p => p.categoria))];
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        selectCat.appendChild(opt);
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('categoria')) selectCat.value = params.get('categoria');

    const aplicar = () => {
        const filtrados = aplicarFiltros(productosIniciales);
        mostrarProductos(filtrados, 'container-productos');
        reasignarBotones();
    };

    selectCat.addEventListener('change', aplicar);
    if (selectOrd) selectOrd.addEventListener('change', aplicar);
}

export async function cargarSeccionProductos() {
    try {
        const datos = await obtenerDatos('../data/db.json');
        const parametros = new URLSearchParams(window.location.search);
        const categoriaSeleccionada = parametros.get('categoria');
        const buscarTermino = parametros.get('buscar');

        let productosMostrar = datos.productos;

        if (categoriaSeleccionada) {
            productosMostrar = productosMostrar.filter(p => p.categoria === categoriaSeleccionada);
        }
        if (buscarTermino) {
            const term = buscarTermino.toLowerCase();
            productosMostrar = productosMostrar.filter(p =>
                p.productName.toLowerCase().includes(term)
            );
        }

        const cabecera = document.querySelector('.categoria-cabecera h1');
        if (cabecera) {
            cabecera.textContent = buscarTermino
                ? `Resultados para "${buscarTermino}"`
                : categoriaSeleccionada || 'Nuestro Catálogo';
        }

        inicializarFiltros(datos, datos.productos);
        mostrarProductos(productosMostrar, 'container-productos');
        reasignarBotones();

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