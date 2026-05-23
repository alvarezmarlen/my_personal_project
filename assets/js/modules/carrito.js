import { actualizarContadorNav } from "./nav.js";

// 🛒 Inicializamos el carrito leyendo de LocalStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || []; // 🌟 Sin comillas en los corchetes

export function agregarAlCarrito(id, nombre, precio) {
    const productoExistente = carrito.find(item => item.id === id);
    
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        const imgCatalogo = document.querySelector('[data-id="${id}"] img') || document.querySelector('img[src*="${id}"]');

        let rutaImagenReal = imgCatalogo ? imgCatalogo.getAttribute('src') : '';

        if (rutaImagenReal) {
            rutaImagenReal = rutaImagenReal.replace(/^\.+[\/]/, ''); // Deja algo como "assets/img/catalogo/..."
        }
        carrito.push({
            id: id,
            productName: nombre,
            precio: precio,
            imagen: rutaImagenReal || `assets/img/catalogo/${id}.png`, // Salvavidas por si acaso
            cantidad: 1
        });
    }
    
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    // Actualizamos el número del Nav al instante
    actualizarContadorNav();

    // ========================================================
    // 🪄 EFECTO ESTILO FARFETCH (FEEDBACK EN DOS TIEMPOS)
    // ========================================================
    const botones = document.querySelectorAll('.btn-comprar');
    let botonPulsado = null;

    botones.forEach(btn => {
        if (btn.dataset.id === id) {
            botonPulsado = btn;
        }
    });
    
    if (botonPulsado) {
        // TIEMPO 1: El tick verde
        botonPulsado.innerHTML = '<i class="fa-solid fa-check"></i> ¡Añadido!'; 
        botonPulsado.style.backgroundColor = "#e8f5e9"; 
        botonPulsado.style.color = "#2e7d32"; 
        botonPulsado.style.pointerEvents = "none"; 
        
        // TIEMPO 2: Cambiar a "Ir a la bolsa"
        setTimeout(() => {
            botonPulsado.textContent = "VER CESTA / IR A LA BOLSA 🍓";
            botonPulsado.style.backgroundColor = "#daffde"; 
            botonPulsado.style.color = "#000";
            botonPulsado.style.pointerEvents = "auto"; 
            
            botonPulsado.onclick = (evento) => {
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
}
