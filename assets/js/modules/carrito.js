// 🛒 Inicializamos el carrito leyendo de LocalStorage (si no hay nada, empieza como un array vacío)
let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");


export function agregarAlCarrito(id, nombre, precio) {
    const productoExistente = carrito.find(item => item.id === id);
    console.log(`Guardando en el carrito: ${nombre} (${precio}€)`);
    if (productoExistente) {
        // ➕ Si ya existe, sumamos 1 a su cantidad
        productoExistente.cantidad++;
    } else {
        // 🆕 Si es nuevo, creamos el objeto y lo metemos al array
        carrito.push({
            id: id,
            producName: nombre,
            precio: precio,
            cantidad: 1 // Éste es su primer elemento, así que arranca en 1
        })
    }
    // 💾 Guardamos la lista actualizada convirtiéndola en texto JSON
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    console.log(carrito); 
}