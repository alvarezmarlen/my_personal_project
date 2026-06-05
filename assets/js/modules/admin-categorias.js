import { api } from "./api.js";

export async function initCategorias() {
    bindCategoriaModal();
}

export async function cargarTablaCategorias() {
    const tbody = document.getElementById('tbody-categorias');
    const vacio = document.getElementById('vacio-categorias');
    if (!tbody) return;

    try {
        const cats = await api.adminGet('/categorias');

        if (cats.length === 0) {
            tbody.innerHTML = '';
            if (vacio) vacio.style.display = 'block';
            return;
        }
        if (vacio) vacio.style.display = 'none';

        tbody.innerHTML = cats.map(c => `<tr>
            <td>${c.id}</td>
            <td><strong>${esc(c.nombre)}</strong></td>
            <td>${c.imagen ? `<img src="${esc(c.imagen)}" alt="${esc(c.nombre)}" style="max-width:50px;max-height:50px;border-radius:4px;">` : '—'}</td>
            <td class="acciones">
                <button class="btn-admin btn-editar" data-id="${c.id}">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button class="btn-admin btn-eliminar" data-id="${c.id}">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>`).join('');

        tbody.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => editarCategoria(parseInt(btn.dataset.id), cats));
        });

        tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => eliminarCategoria(parseInt(btn.dataset.id)));
        });

    } catch (err) {
        console.error('Error al cargar categorías:', err);
        window.adminToast('Error al cargar categorías: ' + err.message, 'error');
    }
}

function bindCategoriaModal() {
    const modal = document.getElementById('modal-categoria');
    if (!modal) return;

    document.getElementById('btn-crear-categoria')?.addEventListener('click', () => {
        abrirModalCategoria();
    });

    modal.querySelectorAll('.admin-modal-close, #btn-cancelar-categoria').forEach(el => {
        el.addEventListener('click', () => cerrarModal('modal-categoria'));
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal('modal-categoria');
    });

    document.getElementById('form-categoria')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarCategoria();
    });
}

function abrirModalCategoria(cat = null) {
    const modal = document.getElementById('modal-categoria');
    const title = document.getElementById('modal-categoria-title');
    const idInput = document.getElementById('cat-id');

    document.getElementById('form-categoria').reset();

    if (cat) {
        title.textContent = 'Editar Categoría';
        idInput.value = cat.id;
        document.getElementById('cat-nombre').value = cat.nombre;
        document.getElementById('cat-imagen').value = cat.imagen || '';
    } else {
        title.textContent = 'Añadir Categoría';
        idInput.value = '';
    }

    modal.style.display = 'flex';
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}

async function guardarCategoria() {
    const id = document.getElementById('cat-id').value;
    const nombre = document.getElementById('cat-nombre').value.trim();
    const imagen = document.getElementById('cat-imagen').value.trim();

    if (!nombre) {
        window.adminToast('El nombre es obligatorio', 'error');
        return;
    }

    try {
        if (id) {
            await api.adminPut(`/categorias/${id}`, { nombre, imagen });
            window.adminToast('Categoría actualizada con éxito', 'success');
        } else {
            await api.adminPost('/categorias', { nombre, imagen });
            window.adminToast('Categoría creada con éxito', 'success');
        }
        cerrarModal('modal-categoria');
        await cargarTablaCategorias();
    } catch (err) {
        window.adminToast('Error: ' + err.message, 'error');
    }
}

async function editarCategoria(id, cats) {
    const cat = cats.find(c => c.id === id);
    if (cat) abrirModalCategoria(cat);
}

async function eliminarCategoria(id) {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
        await api.adminDelete(`/categorias/${id}`);
        window.adminToast('Categoría eliminada con éxito', 'success');
        await cargarTablaCategorias();
    } catch (err) {
        window.adminToast('Error: ' + err.message, 'error');
    }
}

function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}