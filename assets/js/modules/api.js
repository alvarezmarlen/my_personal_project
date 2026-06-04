// ==========================================
// 🔗 CONFIGURACIÓN CENTRALIZADA DE LA API (OFICIAL)
// ==========================================

const API_BASE = 'http://localhost:5000/api';

async function request(url, opciones = {}) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...opciones.headers };
    
    // Si el usuario está logueado y tiene un token, lo enviamos en la cabecera
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_BASE}${url}`, { ...opciones, headers });
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error del servidor');
    }
    return res.json();
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
};