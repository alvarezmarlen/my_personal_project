import { getCart } from "./cartState.js";

export function actualizarContadorNav() {
    const carrito = getCart();
    const totalProductos = carrito.reduce((acumulador, producto) => acumulador + producto.cantidad, 0);

    const contadorBadge = document.querySelector('.contador-carrito');
    if (!contadorBadge) return;

    contadorBadge.textContent = totalProductos;
    contadorBadge.style.display = totalProductos === 0 ? 'none' : 'flex';
}