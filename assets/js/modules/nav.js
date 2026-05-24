import { getCart } from "./cartState.js";
import { usuarioActual, cerrarSesion } from "./auth.js";
import { mostrarToast } from "./ui.js";

function escapar(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

export function actualizarContadorNav() {
    const carrito = getCart();
    const totalProductos = carrito.reduce((acumulador, producto) => acumulador + producto.cantidad, 0);

    const contadorBadge = document.querySelector('.contador-carrito');
    if (!contadorBadge) return;

    contadorBadge.textContent = totalProductos;
    contadorBadge.style.display = totalProductos === 0 ? 'none' : 'flex';
}

export function actualizarNavSesion() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;

    const loginLink = headerRight.querySelector('a[href*="login"]');
    if (!loginLink) return;

    const existing = headerRight.querySelector('.user-section');
    if (existing) existing.remove();

    const usuario = usuarioActual();

    if (usuario) {
        loginLink.style.display = 'none';

        const section = document.createElement('div');
        section.className = 'user-section';
        section.style.cssText = 'display:inline-flex;align-items:center;gap:8px;';
        section.innerHTML = `
            <a href="../pages/cuenta.html" id="user-info-link" style="display:flex;align-items:center;gap:6px;">
                <img src="../assets/img/logo-iconos/icono-cuenta.jpg" alt="Usuario">
                <span class="title">${escapar(usuario.nombre)}</span>
            </a>
            <a href="#" id="logout-link" style="font-size:0.75rem;color:#999;text-decoration:none;">Cerrar sesión</a>
        `;

        loginLink.parentNode.insertBefore(section, loginLink.nextSibling);

        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Seguro que deseas cerrar sesión?')) {
                cerrarSesion();
                window.location.reload();
            }
        });
    } else {
        loginLink.style.display = '';
    }
}

export function inicializarBusqueda() {
    const form = document.getElementById('search-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[name="s"]');
        const term = input.value.trim();
        if (term) {
            const base = window.location.pathname.includes('/pages/') ? './productos.html' : './pages/productos.html';
            window.location.href = base + '?buscar=' + encodeURIComponent(term);
        }
    });
}

export function inicializarEnlacesPendientes() {
    document.querySelectorAll('.link-pendiente').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarToast('Próximamente disponible', 'info');
        });
    });
}