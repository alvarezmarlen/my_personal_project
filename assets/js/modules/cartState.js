let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

export function getCart() {
  return carrito;
}

export function setCart(nuevoCarrito) {
  carrito = nuevoCarrito;
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

export function saveCart() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}
