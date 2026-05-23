// 📦 MÓDULO: Actualizar el número del carrito en la barra de navegación
export function actualizarContadorNav() {
    // 1. Buscamos el carrito en el LocalStorage
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    // 2. Sumamos todas las cantidades de los productos guardados
    const totalProductos = carrito.reduce((acumulador, producto) => acumulador + producto.cantidad, 0);
    
    // 3. Buscamos el elemento de tu Nav donde va el número (puede ser una clase como .contador-carrito o un span)
    const contadorBadge = document.querySelector('.contador-carrito') || document.querySelector('.nav-cart-count');
    
    if (contadorBadge) {
        contadorBadge.textContent = totalProductos;
        
        // Truco de diseño: Si el carrito está vacío, podemos esconder el número para que quede más limpio
        if (totalProductos === 0) {
            contadorBadge.style.display = 'none';
        } else {
            contadorBadge.style.display = 'inline-block';
        }
    }
}