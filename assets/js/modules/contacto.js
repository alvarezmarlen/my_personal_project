import { api } from "./api.js"; // ← Importamos el asistente de la API oficial
import { mostrarToast } from "./ui.js";

export function inicializarContacto() {
    const form = document.querySelector('.formulario-contacto');
    if (!form) return;

    // Ponemos 'async' aquí porque enviar datos a la API toma unos milisegundos
    form.addEventListener('submit', async (e) => {
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

        try {
            // 📨 FASE 6: Enviamos los datos reales al backend de Flask en Docker
            await api.enviarContacto({ 
                nombre, 
                email, 
                mensaje 
            });

            // Si la API responde con éxito, limpiamos el formulario y avisamos al usuario
            form.reset();
            mostrarToast('¡Mensaje enviado con éxito al servidor! 🍓', 'exito');

        } catch (error) {
            console.error("Error al enviar el formulario de contacto:", error);
            mostrarToast('Hubo un error al conectar con el servidor', 'error');
        }
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
