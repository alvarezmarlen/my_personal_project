import { api } from "./api.js"; // ← Importamos el asistente inteligente de la API

const SESION_KEY = 'sesion';

// =========================================================
// 🔑 6.2 FUNCIONES CONECTADAS AL BACKEND (JWT)
// =========================================================
export async function registrarUsuario(nombre, email, password) {
    try {
        // Llamamos al backend usando el objeto oficial de OpenCode
        const respuesta = await api.register({ nombre, email, password });
        return { exito: true, datos: respuesta };
    } catch (error) {
        return { exito: false, error: error.message || 'Error al registrar el usuario' };
    }
}

export async function iniciarSesion(email, password) {
    try {
        // Enviamos las credenciales al endpoint /auth/login de Flask
        const respuesta = await api.login({ email, password });
        
        // El backend nos devuelve un token JWT y los datos del usuario
        // Guardamos el token por separado para que request() lo use automáticamente
        localStorage.setItem('token', respuesta.token);

        // Guardamos los datos básicos del usuario para los menús
        localStorage.setItem(SESION_KEY, JSON.stringify({
            userId: respuesta.usuario.id,
            nombre: respuesta.usuario.nombre,
            email: respuesta.usuario.email
        }));

        // Migrar carrito anónimo (localStorage) al servidor
        const carritoAnonimo = JSON.parse(localStorage.getItem('carrito') || '[]');
        if (carritoAnonimo.length > 0) {
            try {
                for (const item of carritoAnonimo) {
                    await api.addCarrito({
                        producto_id: item.producto_id || item.id,
                        cantidad: item.cantidad
                    });
                }
                localStorage.removeItem('carrito');
            } catch (err) {
                console.warn('No se pudo migrar el carrito anónimo:', err);
            }
        }

        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message || 'Email o contraseña incorrectos' };
    }
}

export function cerrarSesion() {
    localStorage.removeItem('token'); // ← Limpiamos el token de seguridad
    localStorage.removeItem(SESION_KEY);
}

export function usuarioActual() {
    const data = localStorage.getItem(SESION_KEY);
    return data ? JSON.parse(data) : null;
}

export function estaLogueado() {
    return !!localStorage.getItem('token'); // ← Si hay token, es que inició sesión de verdad
}

// =========================================================
// 🎛️ MANEJO DE FORMULARIOS DE LA INTERFAZ
// =========================================================
function marcarErrorCampo(inputId, msg) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const errorSpan = input.parentElement.querySelector('.error-msg');
    input.classList.add('error');
    if (errorSpan) {
        errorSpan.textContent = msg;
        errorSpan.classList.add('visible');
    }
}

export function inicializarLogin() {
    const form = document.querySelector('.formulario-login');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
        document.querySelectorAll('.campo input').forEach(el => el.classList.remove('error'));

        let valido = true;
        if (!email) { marcarErrorCampo('email', 'El correo es obligatorio'); valido = false; }
        if (!password) { marcarErrorCampo('password', 'La contraseña es obligatoria'); valido = false; }
        if (!valido) return;

        // Llamamos a la función asíncrona conectada al backend con await
        const result = await iniciarSesion(email, password);
        if (result.exito) {
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect') || './carrito.html';
            window.location.href = redirect;
        } else {
            marcarErrorCampo('email', result.error);
            marcarErrorCampo('password', result.error);
        }
    });
}

export function inicializarOlvidePassword() {
    const form = document.getElementById('olvide-form');
    const overlay = document.getElementById('olvide-overlay');
    const closeBtn = document.getElementById('olvide-close');
    const formView = document.getElementById('olvide-form-view');
    const successView = document.getElementById('olvide-success-view');

    const olvidoLink = document.querySelector('.enlace-olvido');
    if (olvidoLink) {
        olvidoLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('olvide-email').value = '';
            document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
            document.querySelectorAll('.checkout-campo input').forEach(el => el.classList.remove('error'));
            formView.style.display = 'block';
            successView.style.display = 'none';
            overlay.classList.add('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    }
    if (overlay) {
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
    }
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('olvide-email').value.trim();
            document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
            document.querySelectorAll('.checkout-campo input').forEach(el => el.classList.remove('error'));

                if (!email) {
                const input = document.getElementById('olvide-email');
                input.classList.add('error');
                const span = input.parentElement.querySelector('.error-msg');
                if (span) { span.textContent = 'Introduce tu correo'; span.classList.add('visible'); }
                return;
            }

            formView.style.display = 'none';
            successView.style.display = 'block';

            setTimeout(() => {
                overlay.classList.remove('active');
            }, 2000);
        });
    }
}

export function inicializarRegistro() {
    const form = document.querySelector('.formulario-login');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPw = document.getElementById('confirm-password').value;

        document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
        document.querySelectorAll('.campo input').forEach(el => el.classList.remove('error'));

        let valido = true;
        if (!nombre) { marcarErrorCampo('nombre', 'El nombre es obligatorio'); valido = false; }
        if (!email) { marcarErrorCampo('email', 'El correo es obligatorio'); valido = false; }
        if (!password) {
            marcarErrorCampo('password', 'La contraseña es obligatoria');
            valido = false;
        } else if (password.length < 6) {
            marcarErrorCampo('password', 'Mínimo 6 caracteres');
            valido = false;
        }
        if (!confirmPw) {
            marcarErrorCampo('confirm-password', 'Confirma tu contraseña');
            valido = false;
        } else if (password !== confirmPw) {
            marcarErrorCampo('confirm-password', 'Las contraseñas no coinciden');
            valido = false;
        }
        if (!valido) return;

        const result = await registrarUsuario(nombre, email, password);
        if (result.exito) {
           await iniciarSesion(email, password);
            window.location.href = './carrito.html';
        } else {
            marcarErrorCampo('email', result.error);
        }
    });
}
