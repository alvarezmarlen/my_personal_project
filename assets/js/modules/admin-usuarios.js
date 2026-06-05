import { api } from "./api.js";

export async function initUsuarios() {
    bindUsuarioModal();
}

export async function cargarTablaUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    const vacio = document.getElementById('vacio-usuarios');
    if (!tbody) return;

    try {
        const usuarios = await api.adminGet('/usuarios');

        if (usuarios.length === 0) {
            tbody.innerHTML = '';
            if (vacio) vacio.style.display = 'block';
            return;
        }
        if (vacio) vacio.style.display = 'none';

        tbody.innerHTML = usuarios.map(u => `<tr>
            <td>${u.id}</td>
            <td><strong>${esc(u.nombre)}</strong></td>
            <td>${esc(u.email)}</td>
            <td>${u.is_admin ? '<span class="badge-admin">Sí</span>' : '<span class="badge-user">No</span>'}</td>
            <td>${formatearFecha(u.fecha_registro)}</td>
            <td class="acciones">
                <button class="btn-admin btn-editar" data-id="${u.id}">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button class="btn-admin btn-reset-pw" data-id="${u.id}" data-nombre="${esc(u.nombre)}">
                    <i class="fa-solid fa-key"></i> Password
                </button>
                <button class="btn-admin btn-eliminar" data-id="${u.id}">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </td>
        </tr>`).join('');

        tbody.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => editarUsuario(parseInt(btn.dataset.id), usuarios));
        });

        tbody.querySelectorAll('.btn-reset-pw').forEach(btn => {
            btn.addEventListener('click', () => resetPassword(parseInt(btn.dataset.id), btn.dataset.nombre));
        });

        tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => eliminarUsuario(parseInt(btn.dataset.id)));
        });

    } catch (err) {
        console.error('Error al cargar usuarios:', err);
        window.adminToast('Error al cargar usuarios: ' + err.message, 'error');
    }
}

function bindUsuarioModal() {
    const modal = document.getElementById('modal-usuario');
    if (!modal) return;

    document.getElementById('btn-crear-usuario')?.addEventListener('click', () => {
        abrirModalUsuario();
    });

    modal.querySelectorAll('.admin-modal-close, #btn-cancelar-usuario').forEach(el => {
        el.addEventListener('click', () => cerrarModal('modal-usuario'));
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal('modal-usuario');
    });

    document.getElementById('form-usuario')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarUsuario();
    });
}

function abrirModalUsuario(usuario = null) {
    const modal = document.getElementById('modal-usuario');
    const title = document.getElementById('modal-usuario-title');
    const idInput = document.getElementById('user-id');
    const pwGroup = document.getElementById('user-password-group');
    const pwInput = document.getElementById('user-password');
    const pwLabel = document.getElementById('user-password-label');

    document.getElementById('form-usuario').reset();

    if (usuario) {
        title.textContent = 'Editar Usuario';
        idInput.value = usuario.id;
        document.getElementById('user-nombre').value = usuario.nombre;
        document.getElementById('user-email').value = usuario.email;
        document.getElementById('user-is_admin').checked = usuario.is_admin;
        pwGroup.style.display = 'block';
        pwLabel.textContent = 'Nueva contraseña (dejar en blanco para mantener)';
        pwInput.required = false;
    } else {
        title.textContent = 'Añadir Usuario';
        idInput.value = '';
        document.getElementById('user-is_admin').checked = false;
        pwGroup.style.display = 'block';
        pwLabel.textContent = 'Contraseña *';
        pwInput.required = true;
    }

    modal.style.display = 'flex';
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}

async function guardarUsuario() {
    const id = document.getElementById('user-id').value;
    const nombre = document.getElementById('user-nombre').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const is_admin = document.getElementById('user-is_admin').checked;

    if (!nombre || !email) {
        window.adminToast('Nombre y email son obligatorios', 'error');
        return;
    }

    try {
        if (id) {
            await api.adminPut(`/usuarios/${id}`, { nombre, email, is_admin });
            if (password) {
                await api.adminPut(`/usuarios/${id}/password`, { password });
            }
            window.adminToast('Usuario actualizado con éxito', 'success');
        } else {
            if (!password) {
                window.adminToast('La contraseña es obligatoria para crear un usuario', 'error');
                return;
            }
            await api.adminPost('/usuarios', { nombre, email, password, is_admin });
            window.adminToast('Usuario creado con éxito', 'success');
        }
        cerrarModal('modal-usuario');
        await cargarTablaUsuarios();
    } catch (err) {
        window.adminToast('Error: ' + err.message, 'error');
    }
}

async function editarUsuario(id, usuarios) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) abrirModalUsuario(usuario);
}

async function resetPassword(id, nombre) {
    const nueva = prompt(`Nueva contraseña para ${nombre} (mín. 6 caracteres):`);
    if (!nueva) return;
    if (nueva.length < 6) {
        window.adminToast('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    try {
        await api.adminPut(`/usuarios/${id}/password`, { password: nueva });
        window.adminToast('Contraseña actualizada con éxito', 'success');
    } catch (err) {
        window.adminToast('Error: ' + err.message, 'error');
    }
}

async function eliminarUsuario(id) {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
        await api.adminDelete(`/usuarios/${id}`);
        window.adminToast('Usuario eliminado con éxito', 'success');
        await cargarTablaUsuarios();
    } catch (err) {
        window.adminToast('Error: ' + err.message, 'error');
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

function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
