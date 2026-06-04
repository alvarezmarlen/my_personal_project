import { api } from "./api.js";
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
        resultado = resultado.filter(p => p.categoria_id === parseInt(selectCat.value));
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

async function inicializarFiltros(productosIniciales) {
    const selectCat = document.getElementById('filtro-categoria');
    const selectOrd = document.getElementById('filtro-orden');
    if (!selectCat) return;

    try {
        const categorias = await api.getCategorias();
        categorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.nombre;
            selectCat.appendChild(opt);
        });
    } catch (error) {
        console.warn("No se pudieron cargar categorías para el filtro:", error);
    }

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

// 📦 Cargar catálogo general usando la nueva función oficial
export async function cargarSeccionProductos() {
    try {
        const parametros = new URLSearchParams(window.location.search);
        const categoriaSeleccionada = parametros.get('categoria');
        const buscarTermino = parametros.get('buscar');


        // Preparamos los filtros que le enviaremos a la API si existen
        const filtros = {};
        if (categoriaSeleccionada) filtros.categoria = categoriaSeleccionada;
        if (buscarTermino) filtros.buscar = buscarTermino;

        // Llamamos a la API usando la nueva estructura de la guía
        const productos = await api.getProductos(filtros);

        const cabecera = document.querySelector('.categoria-cabecera h1');
        if (cabecera) {
            cabecera.textContent = buscarTermino
                ? `Resultados para "${buscarTermino}"`
                : categoriaSeleccionada || 'Nuestro Catálogo';
        }

        await inicializarFiltros(productos);
        mostrarProductos(productos, 'container-productos');
        reasignarBotones();

    } catch (error) {
        console.error("No puedo cargar los productos:", error);
    }
}

// 📦 MÓDULO: Cargar la pantalla de detalle de un producto
export async function cargarSeccionDetalle() {
    try {
        const parametros = new URLSearchParams(window.location.search);
        const idBuscado = parametros.get('id');

        // Llamamos al método getProducto de la API oficial
        const productoEncontrado = await api.getProducto(idBuscado);

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
                agregarAlCarrito(
                    evento.target.dataset.id,
                    evento.target.dataset.label,
                    evento.target.dataset.price,
                    evento.target.dataset.image
                );
            });
        }        
    } catch (error) {
        console.error("Error al cargar el detalle:", error);
        document.getElementById('contenedor-detalle').innerHTML = '<p style="text-align:center;margin-top:40px;color:#cc0000;">Error al conectar con el servidor</p>';
    }
}