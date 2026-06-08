// ==========================================
// 🔗 CONFIGURACIÓN CENTRALIZADA DE LA API (OFICIAL)
// ==========================================

const API_BASE = "https://sumi-backend-7439.onrender.com/api/";

async function request(url, opciones = {}) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...opciones.headers };
    
    // Si el usuario está logueado y tiene un token, lo enviamos en la cabecera
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_BASE}${url}`, { ...opciones, headers });
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('sesion');
            localStorage.removeItem('carrito');
            mostrarModalSesionExpirada();
        }
        throw new Error(err.message || 'Error del servidor');
    }
    return res.json();
}

function mostrarModalSesionExpirada() {
    if (document.getElementById('modal-sesion-expirada')) return;
    const modal = document.createElement('div');
    modal.id = 'modal-sesion-expirada';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;';
    modal.innerHTML = `
        <div style="background:#fff;padding:2rem 2.5rem;border-radius:16px;text-align:center;max-width:380px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
            <p style="font-size:1.1rem;margin-bottom:1.5rem;color:#333;">⏳ Tu sesi&oacute;n ha expirado.<br>Inicia sesi&oacute;n de nuevo para continuar.</p>
            <a href="../pages/login.html" style="display:inline-block;background:#f7d6d6;color:#333;padding:10px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">Iniciar sesi&oacute;n</a>
        </div>
    `;
    document.body.appendChild(modal);
}

// Exportamos el objeto 'api' con todos los endpoints centralizados
export const api = {
    // Productos
    getProductos: (params) => request(`/productos?${new URLSearchParams(params)}`),
    getProducto: (id) => request(`/productos/${id}`),
    getCategorias: () => request('/categorias'),

    // Auth
    register: (d) => request('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
    login: (d) => request('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
    getPerfil: () => request('/auth/me'),

    // Carrito
    getCarrito: () => request('/carrito'),
    addCarrito: (d) => request('/carrito', { method: 'POST', body: JSON.stringify(d) }),
    updateCarrito: (id, d) => request(`/carrito/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
    deleteCarrito: (id) => request(`/carrito/${id}`, { method: 'DELETE' }),

    // Pedidos
    crearPedido: (d) => request('/pedidos', { method: 'POST', body: JSON.stringify(d) }),
    getPedidos: () => request('/pedidos'),

    // Contacto
    enviarContacto: (d) => request('/contacto', { method: 'POST', body: JSON.stringify(d) }),

    // Admin
    adminGet: (url) => request(`/admin${url}`),
    adminPost: (url, d) => request(`/admin${url}`, { method: 'POST', body: JSON.stringify(d) }),
    adminPut: (url, d) => request(`/admin${url}`, { method: 'PUT', body: JSON.stringify(d) }),
    adminDelete: (url) => request(`/admin${url}`, { method: 'DELETE' }),
    adminUpload: async (file) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('imagen', file);
        const res = await fetch(`https://sumi-backend-7439.onrender.com/api/admin/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Error al subir imagen');
        }
        return res.json();
    }
};