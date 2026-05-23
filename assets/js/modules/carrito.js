import { actualizarContadorNav } from "./nav.js";
import { getCart, saveCart } from "./cartState.js";

export function agregarAlCarrito(id, nombre, precio, imagenUrl) {
    const carrito = getCart();
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: id,
            productName: nombre,
            precio: precio,
            imagen: imagenUrl || `assets/img/catalogo/${id}.png`,
            cantidad: 1
        });
    }

    saveCart();
    actualizarContadorNav();
    mostrarFeedbackBoton(id);
}

function mostrarFeedbackBoton(id) {
    const boton = document.querySelector(`.btn-comprar[data-id="${id}"]`);
    if (!boton) return;

    boton.innerHTML = '<i class="fa-solid fa-check"></i> ¡Añadido!';
    boton.style.backgroundColor = "#e8f5e9";
    boton.style.color = "#2e7d32";
    boton.style.pointerEvents = "none";

    setTimeout(() => {
        const botonNuevo = boton.cloneNode(true);
        boton.replaceWith(botonNuevo);

        botonNuevo.textContent = "VER CESTA / IR A LA BOLSA 🍓";
        botonNuevo.style.backgroundColor = "#daffde";
        botonNuevo.style.color = "#000";
        botonNuevo.style.pointerEvents = "auto";

        botonNuevo.onclick = (evento) => {
            evento.preventDefault();
            evento.stopPropagation();

            if (window.location.pathname.includes('/pages/')) {
                window.location.href = "./carrito.html";
            } else {
                window.location.href = "./pages/carrito.html";
            }
        };
    }, 1500);
}
