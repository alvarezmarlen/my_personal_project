import { usuarioActual, cerrarSesion } from "./auth.js";

function escapar(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

export function inicializarCuenta() {
    const user = usuarioActual();
    if (!user) {
        window.location.href = 'login.html?redirect=cuenta.html';
        return;
    }

    document.getElementById('perfil-nombre').textContent = user.nombre;
    document.getElementById('perfil-email').textContent = user.email;

    document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
        if (confirm('¿Seguro que deseas cerrar sesión?')) {
            cerrarSesion();
            window.location.href = '../index.html';
        }
    });

    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const lista = document.getElementById('pedidos-lista');

    if (pedidos.length === 0) {
        lista.innerHTML = '<p class="sin-pedidos">Aún no has realizado ningún pedido.</p>';
        return;
    }

    lista.innerHTML = pedidos.map(p => `
        <div class="pedido-card">
            <div class="pedido-header">
                <span><strong>Pedido #${escapar(p.id.slice(-6))}</strong></span>
                <span>${escapar(p.fecha)}</span>
            </div>
            <div class="pedido-items">
                ${p.productos.map(prod => `${escapar(prod.nombre)} x${escapar(prod.cantidad)}`).join(', ')}
            </div>
            <div class="pedido-total">Total: ${escapar(p.total)}€</div>
        </div>
    `).join('');
}
