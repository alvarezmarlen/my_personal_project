import { api } from "./api.js";

export async function initPedidos() {
}

export async function cargarTablaPedidos() {
    const tbody = document.getElementById('tbody-pedidos');
    const vacio = document.getElementById('vacio-pedidos');
    if (!tbody) return;

    try {
        const pedidos = await api.adminGet('/pedidos');

        if (pedidos.length === 0) {
            tbody.innerHTML = '';
            if (vacio) vacio.style.display = 'block';
            return;
        }
        if (vacio) vacio.style.display = 'none';

        tbody.innerHTML = pedidos.map(p => `<tr>
            <td>${p.id}</td>
            <td><strong>${esc(p.usuario_nombre)}</strong></td>
            <td>${esc(p.usuario_email)}</td>
            <td>${formatearFecha(p.fecha)}</td>
            <td><strong>${parseFloat(p.total).toFixed(2)}€</strong></td>
            <td>${esc(p.direccion_envio)}</td>
            <td>${formatearArticulos(p.articulos)}</td>
        </tr>`).join('');

    } catch (err) {
        console.error('Error al cargar pedidos:', err);
        window.adminToast('Error al cargar pedidos: ' + err.message, 'error');
    }
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '—';
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatearArticulos(articulos) {
    if (!articulos || articulos.length === 0) return '—';
    return articulos.map(a =>
        `${esc(a.nombre)} x${a.cantidad} (${parseFloat(a.precio_unitario).toFixed(2)}€)`
    ).join('<br>');
}

function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}