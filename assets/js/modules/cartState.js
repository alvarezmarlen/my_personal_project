import { api } from "./api.js";
import { estaLogueado } from "./auth.js";

let carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];

/**
 * 🛒 FASE 6: Obtener el carrito (Desde el backend o LocalStorage)
 */
export async function getCart() {
  if (estaLogueado()) {
    try {
      // Si está logueado, le pedimos el carrito real a Flask en Docker
      const carritoServidor = await api.getCarrito();
      return carritoServidor;
    } catch (error) {
      console.error("Error al obtener el carrito del servidor:", error);
      return carritoLocal; // Si falla la API, devolvemos el local por seguridad
    }
  }
  return carritoLocal; // Usuario no logueado
}

/**
 * Guardar el carrito por completo
 */
export async function setCart(nuevoCarrito) {
  carritoLocal = nuevoCarrito;
  localStorage.setItem("carrito", JSON.stringify(carritoLocal));

  // Nota: En un sistema conectado por API, los cambios del carrito 
  // se suelen hacer uno a uno con addCarrito, updateCarrito o deleteCarrito.
  // Dejamos esta función para que no rompa tus archivos visuales (UI).
}

/**
 * Sincronizar el estado local con la caché del navegador
 */
export function saveCart() {
  localStorage.setItem("carrito", JSON.stringify(carritoLocal));
}