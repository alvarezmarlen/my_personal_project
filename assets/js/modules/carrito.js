import { api } from "./api.js";
import { estaLogueado } from "./auth.js";
import { actualizarContadorNav } from "./nav.js";
import { getCart, saveCart } from "./cartState.js";

// Convertimos la función en async porque hablar con el backend toma unos milisegundos
export async function agregarAlCarrito(id, nombre, precio, imagenUrl) {
    const carrito = await getCart();  // Ahora getCart requiere un await
    const productoExistente = carrito.find(item => item.id === id);
// 🛒 FASE 6: Si está logueado, informamos al backend en Docker
    if (estaLogueado()) {
        try {
            // Mandamos el producto_id y la cantidad al servidor
            await api.addCarrito({
                producto_id: id,
                cantidad: 1
            });
        } catch (error) {
            console.error("No se pudo sincronizar el producto con el backend:", error);
        }
    }

    // Mantenemos la lógica de la interfaz en local para que todo se mueva rápido visualmente
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
