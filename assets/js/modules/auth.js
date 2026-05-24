const USUARIOS_KEY = 'usuarios';
const SESION_KEY = 'sesion';

function getUsuarios() {
    return JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
}

function saveUsuarios(usuarios) {
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
}

export function registrarUsuario(nombre, email, password) {
    const usuarios = getUsuarios();
    if (usuarios.find(u => u.email === email)) {
        return { exito: false, error: 'Este correo ya está registrado' };
    }
    const nuevo = { id: Date.now().toString(), nombre, email, password };
    usuarios.push(nuevo);
    saveUsuarios(usuarios);
    return { exito: true };
}

export function iniciarSesion(email, password) {
    const usuarios = getUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    if (!usuario) {
        return { exito: false, error: 'Email o contraseña incorrectos' };
    }
    localStorage.setItem(SESION_KEY, JSON.stringify({
        userId: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
    }));
    return { exito: true };
}

export function cerrarSesion() {
    localStorage.removeItem(SESION_KEY);
}

export function usuarioActual() {
    const data = localStorage.getItem(SESION_KEY);
    return data ? JSON.parse(data) : null;
}

export function estaLogueado() {
    return !!localStorage.getItem(SESION_KEY);
}

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

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
        document.querySelectorAll('.campo input').forEach(el => el.classList.remove('error'));

        let valido = true;
        if (!email) { marcarErrorCampo('email', 'El correo es obligatorio'); valido = false; }
        if (!password) { marcarErrorCampo('password', 'La contraseña es obligatoria'); valido = false; }
        if (!valido) return;

        const result = iniciarSesion(email, password);
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

    form.addEventListener('submit', (e) => {
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

        const result = registrarUsuario(nombre, email, password);
        if (result.exito) {
            iniciarSesion(email, password);
            window.location.href = './carrito.html';
        } else {
            marcarErrorCampo('email', result.error);
        }
    });
}
