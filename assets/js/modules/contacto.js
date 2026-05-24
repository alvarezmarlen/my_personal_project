import { mostrarToast } from "./ui.js";

export function inicializarContacto() {
    const form = document.querySelector('.formulario-contacto');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
        document.querySelectorAll('.campo input, .campo textarea').forEach(el => el.classList.remove('error'));

        let valido = true;

        if (!nombre) { marcarError('nombre', 'El nombre es obligatorio'); valido = false; }
        if (!email) { marcarError('email', 'El correo es obligatorio'); valido = false; }
        if (!mensaje) { marcarError('mensaje', 'El mensaje es obligatorio'); valido = false; }

        if (!valido) return;

        const mensajes = JSON.parse(localStorage.getItem('contactos') || '[]');
        mensajes.push({ nombre, email, mensaje, fecha: new Date().toISOString() });
        localStorage.setItem('contactos', JSON.stringify(mensajes));

        form.reset();
        mostrarToast('¡Mensaje enviado con éxito!', 'exito');
    });
}

function marcarError(inputId, msg) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const errorSpan = input.parentElement.querySelector('.error-msg');
    input.classList.add('error');
    if (errorSpan) {
        errorSpan.textContent = msg;
        errorSpan.classList.add('visible');
    }
}
