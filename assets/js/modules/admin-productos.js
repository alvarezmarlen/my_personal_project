import { api } from "./api.js";

let categoriasCache = [];

export async function initProductos() {
    await Promise.all([
        cargarCategoriasSelect(),
        bindProductoModal()
    ]);
}

export async function cargarTablaProductos() {
    const tbody = document.getElementById('tbody-productos');
    const vacio = document.getElementById('vacio-productos');
    if (!tbody) return;

    try {
        const productos = await api.adminGet('/productos');
        const cats = await api.adminGet('/categorias');
        categoriasCache = cats;

        if (productos.length === 0) {
            tbody.innerHTML = '';
            if (vacio) vacio.style.display = 'block';
            return;
        }
        if (vacio) vacio.style.display = 'none';

        tbody.innerHTML = productos.map(p => {
            const cat = cats.find(c => c.id === p.categoria_id);
            return `<tr>
                <td>${p.id}</td>
                <td><strong>${esc(p.nombre)}</strong></td>
                <td>${parseFloat(p.precio).toFixed(2)}€</td>
                <td>${p.stock}</td>
                <td>${cat ? esc(cat.nombre) : '—'}</td>
                <td class="acciones">
                    <button class="btn-admin btn-editar" data-id="${p.id}">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn-admin btn-eliminar" data-id="${p.id}">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>`;
        }).join('');

        // Eventos editar
        tbody.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => editarProducto(parseInt(btn.dataset.id), productos));
        });

        // Eventos eliminar
        tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => eliminarProducto(parseInt(btn.dataset.id)));
        });

    } catch (err) {
        console.error('Error al cargar productos:', err);
        window.adminToast('Error al cargar productos: ' + err.message, 'error');
    }
}

async function cargarCategoriasSelect() {
    const select = document.getElementById('prod-categoria');
    if (!select) return;
    try {
        const cats = await api.adminGet('/categorias');
        categoriasCache = cats;
        select.innerHTML = cats.map(c =>
            `<option value="${c.id}">${esc(c.nombre)}</option>`
        ).join('');
    } catch (err) {
        console.error('Error al cargar categorías:', err);
    }
}

function bindProductoModal() {
    const modal = document.getElementById('modal-producto');
    if (!modal) return;

    // Abrir modal crear
    document.getElementById('btn-crear-producto')?.addEventListener('click', () => {
        abrirModalProducto();
    });

    // Cerrar
    modal.querySelectorAll('.admin-modal-close, #btn-cancelar-producto').forEach(el => {
        el.addEventListener('click', () => cerrarModal('modal-producto'));
    });

    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal('modal-producto');
    });

    // Preview imagen al escribir URL
    document.getElementById('prod-imagen')?.addEventListener('input', (e) => {
        const preview = document.getElementById('prod-imagen-preview');
        if (e.target.value) {
            preview.src = e.target.value;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    });

    // Subir archivo
    document.getElementById('prod-imagen-file')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const result = await api.adminUpload(file);
            document.getElementById('prod-imagen').value = result.url;
            const preview = document.getElementById('prod-imagen-preview');
            preview.src = result.url;
            preview.style.display = 'block';
            window.adminToast('Imagen subida con éxito', 'success');
        } catch (err) {
            window.adminToast('Error al subir imagen: ' + err.message, 'error');
        }
    });

    // Submit form
    document.getElementById('form-producto')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarProducto();
    });
}

function abrirModalProducto(producto = null) {
    const modal = document.getElementById('modal-producto');
    const title = document.getElementById('modal-producto-title');
    const idInput = document.getElementById('prod-id');

    // Reset
    document.getElementById('form-producto').reset();
    document.getElementById('prod-imagen-preview').style.display = 'none';

    if (producto) {
        title.textContent = 'Editar Producto';
        idInput.value = producto.id;
        document.getElementById('prod-nombre').value = producto.nombre;
        document.getElementById('prod-precio').value = producto.precio;
        document.getElementById('prod-stock').value = producto.stock;
        document.getElementById('prod-categoria').value = producto.categoria_id;
        document.getElementById('prod-materiales').value = producto.materiales || '';
        document.getElementById('prod-descripcion').value = producto.descripcion || '';
        if (producto.imagen) {
            document.getElementById('prod-imagen').value = producto.imagen;
            const preview = document.getElementById('prod-imagen-preview');
            preview.src = producto.imagen;
            preview.style.display = 'block';
        }
    } else {
        title.textContent = 'Añadir Producto';
        idInput.value = '';
    }

    modal.style.display = 'flex';
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}

async function guardarProducto() {
    const id = document.getElementById('prod-id').value;
    const datos = {
        nombre: document.getElementById('prod-nombre').value.trim(),
        precio: parseFloat(document.getElementById('prod-precio').value) || 0,
        stock: parseInt(document.getElementById('prod-stock').value) || 0,
        categoria_id: parseInt(document.getElementById('prod-categoria').value) || 1,
        materiales: document.getElementById('prod-materiales').value.trim(),
        descripcion: document.getElementById('prod-descripcion').value.trim(),
        imagen: document.getElementById('prod-imagen').value.trim()
    };

    if (!datos.nombre) {
        window.adminToast('El nombre es obligatorio', 'error');
        return;
    }

    try {
        if (id) {
            await api.adminPut(`/productos/${id}`, datos);
            window.adminToast('Producto actualizado con éxito', 'success');
        } else {
            await api.adminPost('/productos', datos);
            window.adminToast('Producto creado con éxito', 'success');
        }
        cerrarModal('modal-producto');
        await cargarTablaProductos();
    } catch (err) {
        window.adminToast('Error: ' + err.message, 'error');
    }
}

async function editarProducto(id, productos) {
    const prod = productos.find(p => p.id === id);
    if (prod) abrirModalProducto(prod);
}

async function eliminarProducto(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
        await api.adminDelete(`/productos/${id}`);
        window.adminToast('Producto eliminado con éxito', 'success');
        await cargarTablaProductos();
    } catch (err) {
        window.adminToast('Error: ' + err.message, 'error');
    }
}

function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}