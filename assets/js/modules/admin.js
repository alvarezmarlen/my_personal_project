import { esAdmin, cerrarSesion } from "./auth.js";
import { api } from "./api.js";
import { cargarTablaProductos, initProductos } from "./admin-productos.js";
import { cargarTablaCategorias, initCategorias } from "./admin-categorias.js";
import { cargarTablaUsuarios, initUsuarios } from "./admin-usuarios.js";
import { cargarTablaPedidos, initPedidos } from "./admin-pedidos.js";

let toastTimeout = null;

function mostrarToast(msg, tipo = 'success') {
    const el = document.getElementById('admin-toast');
    if (!el) return;
    clearTimeout(toastTimeout);
    el.textContent = msg;
    el.className = 'admin-toast ' + tipo;
    el.style.display = 'block';
    toastTimeout = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

window.adminToast = mostrarToast;

document.addEventListener('DOMContentLoaded', async () => {
    if (!esAdmin()) {
        const errorDiv = document.getElementById('admin-error');
        if (errorDiv) errorDiv.style.display = 'block';
        setTimeout(() => { window.location.href = '../index.html'; }, 2500);
        return;
    }

    initTabs();
    await initProductos();
    await initCategorias();
    await initUsuarios();
    await initPedidos();

    // Cargar pestaña activa inicial
    const tab = document.querySelector('.admin-tab.active');
    if (tab) cambiarTab(tab.dataset.tab);
});

function initTabs() {
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.addEventListener('click', () => cambiarTab(btn.dataset.tab));
    });
}

function cambiarTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));

    const tabBtn = document.querySelector(`.admin-tab[data-tab="${tabId}"]`);
    const tabContent = document.getElementById(`tab-${tabId}`);
    if (tabBtn) tabBtn.classList.add('active');
    if (tabContent) tabContent.classList.add('active');

    if (tabId === 'productos') cargarTablaProductos();
    else if (tabId === 'categorias') cargarTablaCategorias();
    else if (tabId === 'usuarios') cargarTablaUsuarios();
    else if (tabId === 'pedidos') cargarTablaPedidos();
}