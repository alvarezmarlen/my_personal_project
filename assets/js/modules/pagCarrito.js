import { actualizarContadorNav } from "./nav.js";

// Leer el carrito real de la memoria LocalStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// 🛒 FUNCIÓN 1: Pintar la cesta y calcular totales reales
export function renderizarCarrito() {
    const contenedorProductos = document.querySelector('.productos-carrito');
    const resumenSubtotal = document.querySelectorAll('.linea-resumen span')[1];
    const precioTotal = document.querySelector('.precio-total');

    if (!contenedorProductos) return; 

    if (carrito.length === 0) {
        contenedorProductos.innerHTML = '<p style="margin-top:20px; color:#777; text-align:center;">Tu cesta está vacía 🍓</p>';
        if (resumenSubtotal) resumenSubtotal.textContent = '0.00€';
        if (precioTotal) precioTotal.textContent = '0.00€';
        return;
    }

    contenedorProductos.innerHTML = '';
    let totalAcumulado = 0;

    carrito.forEach(producto => {
        const subtotalProducto = parseFloat(producto.precio) * producto.cantidad;
        totalAcumulado += subtotalProducto;

        // 🌟 SOLUCIÓN DIRECTA: Usamos exactamente la ruta original de tu db.json.
        // Como ya viene guardada con un solo "../", funciona de maravilla desde la carpeta /pages/.
        let rutaImagen = producto.imagen || producto.img || '';

        // Inyectamos la estructura final limpia con el tamaño de foto corregido (70px)
        contenedorProductos.innerHTML += `
            <div class="tarjeta-producto-carrito" data-id="${producto.id}" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <img src="${rutaImagen}" alt="${producto.productName}" class="img-producto-carrito" style="width:70px; height:70px; object-fit:cover; border-radius:8px;">
                
                <div class="info-producto-carrito" style="flex-grow: 1; margin-left: 15px;">
                    <h3>${producto.productName}</h3>
                    <p class="precio-unitario">${parseFloat(producto.precio).toFixed(2)}€</p>
                </div>

                <div class="cantidad-control">
                    <button class="btn-cantidad btn-menos" data-action="menos">-</button>
                    <span class="numero-cantidad">${producto.cantidad}</span>
                    <button class="btn-cantidad btn-mas" data-action="mas">+</button>
                </div>

                <p class="precio-subtotal" style="margin: 0 20px; min-width: 60px; text-align: right;">${subtotalProducto.toFixed(2)}€</p>

                <button class="btn-eliminar" style="background:none; border:none; color:#c62828; cursor:pointer; font-size:14px; padding:5px; margin-left: auto; display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-trash"></i> Quitar
                </button>
            </div>
        `;
    });

    // Actualizamos las cifras numéricas del recuadro derecho de pedido
    if (resumenSubtotal) resumenSubtotal.textContent = `${totalAcumulado.toFixed(2)}€`;
    if (precioTotal) precioTotal.textContent = `${totalAcumulado.toFixed(2)}€`;

    asignarEventosBotones();
}

// 🧠 FUNCIÓN 2: Lógica interactiva de botones (+ , - , Quitar)
function asignarEventosBotones() {
    // Escuchar botones MÁS (+)
    document.querySelectorAll('.btn-mas').forEach(boton => {
        boton.onclick = (e) => {
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => item.id == id);
            if (producto) {
                producto.cantidad++;
                guardarYRefrescar();
            }
        };
    });

    // Escuchar botones MENOS (-)
    document.querySelectorAll('.btn-menos').forEach(boton => {
        boton.onclick = (e) => {
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => item.id == id);
            if (producto && producto.cantidad > 1) {
                producto.cantidad--;
                guardarYRefrescar();
            }
        };
    });

    // Escuchar botones ELIMINAR 
    document.querySelectorAll('.btn-eliminar').forEach(boton => {
        boton.onclick = (e) => {
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => item.id == id);
            
            if (confirm(`¿Seguro que deseas quitar "${producto.productName}" de tu cesta?`)) {
                carrito = carrito.filter(item => item.id != id);
                guardarYRefrescar();
            }
        };
    });
}

function guardarYRefrescar() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContadorNav();
}