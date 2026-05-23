import { actualizarContadorNav } from "./nav.js";
import { getCart, setCart, saveCart } from "./cartState.js";

const GASTOS_ENVIO = 4.90;

export function renderizarCarrito() {
    const carrito = getCart();
    const contenedorProductos = document.querySelector('.productos-carrito');
    const resumenSubtotal = document.getElementById('subtotal-valor');
    const precioTotal = document.getElementById('total-valor');
    const envioSpan = document.getElementById('envio-valor');

    if (!contenedorProductos) return;

    if (carrito.length === 0) {
        contenedorProductos.innerHTML = '<p class="carrito-vacio">Tu cesta está vacía 🍓</p>';
        if (resumenSubtotal) resumenSubtotal.textContent = '0.00€';
        if (precioTotal) precioTotal.textContent = '0.00€';
        if (envioSpan) envioSpan.textContent = '4,90€';
        return;
    }

    contenedorProductos.innerHTML = '';
    let totalAcumulado = 0;

    carrito.forEach(producto => {
        const subtotalProducto = parseFloat(producto.precio) * producto.cantidad;
        totalAcumulado += subtotalProducto;

        let rutaImagen = producto.imagen || producto.img || '';

        contenedorProductos.innerHTML += `
            <div class="tarjeta-producto-carrito" data-id="${producto.id}">
                <img src="${rutaImagen}" alt="${producto.productName}" class="img-producto-carrito">
                <div class="info-producto-carrito">
                    <h3>${producto.productName}</h3>
                    <p class="precio-unitario">${parseFloat(producto.precio).toFixed(2)}€</p>
                </div>
                <div class="cantidad-control">
                    <button class="btn-cantidad btn-menos" data-action="menos">-</button>
                    <span class="numero-cantidad">${producto.cantidad}</span>
                    <button class="btn-cantidad btn-mas" data-action="mas">+</button>
                </div>
                <p class="precio-subtotal">${subtotalProducto.toFixed(2)}€</p>
                <button class="btn-eliminar">
                    <i class="fa-solid fa-trash"></i> Quitar
                </button>
            </div>
        `;
    });

    const totalConEnvio = totalAcumulado + GASTOS_ENVIO;
    if (resumenSubtotal) resumenSubtotal.textContent = `${totalAcumulado.toFixed(2)}€`;
    if (precioTotal) precioTotal.textContent = `${totalConEnvio.toFixed(2)}€`;
    if (envioSpan) envioSpan.textContent = `${GASTOS_ENVIO.toFixed(2).replace('.', ',')}€`;

    asignarEventosBotones();
}

function asignarEventosBotones() {
    document.querySelectorAll('.btn-mas').forEach(boton => {
        boton.onclick = (e) => {
            const carrito = getCart();
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => item.id == id);
            if (producto) {
                producto.cantidad++;
                guardarYRefrescar();
            }
        };
    });

    document.querySelectorAll('.btn-menos').forEach(boton => {
        boton.onclick = (e) => {
            const carrito = getCart();
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => item.id == id);
            if (producto && producto.cantidad > 1) {
                producto.cantidad--;
                guardarYRefrescar();
            }
        };
    });

    document.querySelectorAll('.btn-eliminar').forEach(boton => {
        boton.onclick = (e) => {
            let carrito = getCart();
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => item.id == id);

            if (confirm(`¿Seguro que deseas quitar "${producto.productName}" de tu cesta?`)) {
                carrito = carrito.filter(item => item.id != id);
                setCart(carrito);
                guardarYRefrescar();
            }
        };
    });
}

function guardarYRefrescar() {
    saveCart();
    renderizarCarrito();
    actualizarContadorNav();
}