import { api } from "./api.js"; // ← Importamos el asistente de la API oficial
import { usuarioActual, cerrarSesion } from "./auth.js";

function escapar(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// Convertimos la función en async porque consultar al servidor toma unos milisegundos
export async function inicializarCuenta() {
    const user = usuarioActual();
    if (!user) {
        window.location.href = 'login.html?redirect=cuenta.html';
        return;
    }
    // Ponemos los datos locales iniciales mientras carga la API
    document.getElementById('perfil-nombre').textContent = user.nombre;
    document.getElementById('perfil-email').textContent = user.email;

// 👤 FASE 6: Intentamos traer los datos más frescos del perfil desde la API
    try {
        const perfilServidor = await api.getPerfil();
        if (perfilServidor) {
            document.getElementById('perfil-nombre').textContent = perfilServidor.nombre || user.nombre;
            document.getElementById('perfil-email').textContent = perfilServidor.email || user.email;
        }
    } catch (error) {
        console.warn("No se pudo actualizar el perfil desde el servidor, usando datos locales:", error);
    }

    // Configuración del botón para Cerrar Sesión
    document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
        if (confirm('¿Seguro que deseas cerrar sesión?')) {
            cerrarSesion();
            window.location.href = '../index.html';
        }
    });

    const lista = document.getElementById('pedidos-lista');
    if (!lista) return;

    try {
        // 📦 FASE 6: Traemos el historial de pedidos reales de este usuario desde Flask
        const pedidos = await api.getPedidos();

        if (!pedidos || pedidos.length === 0) {
            lista.innerHTML = '<p class="sin-pedidos">Aún no has realizado ningún pedido. 🍓</p>';
            return;
        }

        // Renderizamos las tarjetas mapeando los datos reales del backend
        lista.innerHTML = pedidos.map(p => {
            // El backend devuelve los productos como un array de objetos
            const textoProductos = p.productos && Array.isArray(p.productos)
                ? p.productos.map(prod => `${escapar(prod.productName || prod.nombre)} x${escapar(prod.cantidad)}`).join(', ')
                : 'Productos en este pedido';

            // Formateamos la fecha si viene en formato ISO, o usamos la que nos da el backend
            const fechaFormateada = p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : 'Reciente';

            return `
                <div class="pedido-card">
                    <div class="pedido-header">
                        <span><strong>Pedido #${escapar(String(p.id).slice(-6))}</strong></span>
                        <span>${escapar(fechaFormateada)}</span>
                    </div>
                    <div class="pedido-items">
                        ${textoProductos}
                    </div>
                    <div class="pedido-total">Total: ${parseFloat(p.total).toFixed(2)}€</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Error al obtener los pedidos de la API:", error);
        lista.innerHTML = '<p class="sin-pedidos" style="color: #cc0000;">Error al conectar con el servidor para cargar tus pedidos.</p>';
    }
}