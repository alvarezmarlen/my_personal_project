import { actualizarContadorNav } from "./nav.js";
import { getCart, setCart, saveCart } from "./cartState.js";
import { estaLogueado, usuarioActual } from "./auth.js";

function escapar(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

const GASTOS_ENVIO = 4.90;

export function renderizarCarrito() {
    const carrito = getCart();
    const contenedorProductos = document.querySelector('.productos-carrito');
    const resumenSubtotal = document.getElementById('subtotal-valor');
    const precioTotal = document.getElementById('total-valor');
    const envioSpan = document.getElementById('envio-valor');

    if (!contenedorProductos) return;

    if (carrito.length === 0) {
        contenedorProductos.innerHTML = '<p class="carrito-vacio">Tu cesta está vacía 🍓</p>';
        if (resumenSubtotal) resumenSubtotal.textContent = '0.00€';
        if (precioTotal) precioTotal.textContent = '0.00€';
        if (envioSpan) envioSpan.textContent = '4,90€';
        gestionarBotonPago();
        return;
    }

    contenedorProductos.innerHTML = '';
    let totalAcumulado = 0;

    carrito.forEach(producto => {
        const subtotalProducto = parseFloat(producto.precio) * producto.cantidad;
        totalAcumulado += subtotalProducto;

        let rutaImagen = producto.imagen || producto.img || '';

        contenedorProductos.innerHTML += `
            <div class="tarjeta-producto-carrito" data-id="${escapar(producto.id)}">
                <img src="${escapar(rutaImagen)}" alt="${escapar(producto.productName)}" class="img-producto-carrito">
                <div class="info-producto-carrito">
                    <h3>${escapar(producto.productName)}</h3>
                    <p class="precio-unitario">${parseFloat(producto.precio).toFixed(2)}€</p>
                </div>
                <div class="cantidad-control">
                    <button class="btn-cantidad btn-menos" data-action="menos">-</button>
                    <span class="numero-cantidad">${escapar(producto.cantidad)}</span>
                    <button class="btn-cantidad btn-mas" data-action="mas">+</button>
                </div>
                <p class="precio-subtotal">${subtotalProducto.toFixed(2)}€</p>
                <button class="btn-eliminar">
                    <i class="fa-solid fa-trash"></i> Quitar
                </button>
            </div>
        `;
    });

    const totalConEnvio = totalAcumulado + GASTOS_ENVIO;
    if (resumenSubtotal) resumenSubtotal.textContent = `${totalAcumulado.toFixed(2)}€`;
    if (precioTotal) precioTotal.textContent = `${totalConEnvio.toFixed(2)}€`;
    if (envioSpan) envioSpan.textContent = `${GASTOS_ENVIO.toFixed(2).replace('.', ',')}€`;

    asignarEventosBotones();
    gestionarBotonPago();
}

function gestionarBotonPago() {
    const btnPagar = document.querySelector('.btn-pagar');
    if (!btnPagar) return;
    const vacio = getCart().length === 0;
    btnPagar.disabled = vacio;
    btnPagar.style.opacity = vacio ? '0.5' : '1';
    btnPagar.style.cursor = vacio ? 'not-allowed' : 'pointer';
}

function asignarEventosBotones() {
    document.querySelectorAll('.btn-mas').forEach(boton => {
        boton.onclick = (e) => {
            const carrito = getCart();
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => item.id == id);
            if (producto) {
                producto.cantidad++;
                guardarYRefrescar();
            }
        };
    });

    document.querySelectorAll('.btn-menos').forEach(boton => {
        boton.onclick = (e) => {
            const carrito = getCart();
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => item.id == id);
            if (producto && producto.cantidad > 1) {
                producto.cantidad--;
                guardarYRefrescar();
            }
        };
    });

    document.querySelectorAll('.btn-eliminar').forEach(boton => {
        boton.onclick = (e) => {
            let carrito = getCart();
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => item.id == id);

            if (confirm(`¿Seguro que deseas quitar "${producto.productName}" de tu cesta?`)) {
                carrito = carrito.filter(item => item.id != id);
                setCart(carrito);
                guardarYRefrescar();
            }
        };
    });
}

function guardarYRefrescar() {
    saveCart();
    renderizarCarrito();
    actualizarContadorNav();
}

const btnPagar = document.querySelector('.btn-pagar');
if (btnPagar) {
    btnPagar.onclick = abrirCheckout;
}

const overlay = document.getElementById('checkout-overlay');
const closeBtn = document.getElementById('checkout-close');
const form = document.getElementById('checkout-form');
const formView = document.getElementById('checkout-form-view');
const successView = document.getElementById('checkout-success-view');
const successNombre = document.getElementById('success-nombre');

if (closeBtn) {
    closeBtn.onclick = cerrarCheckout;
}

if (overlay) {
    overlay.onclick = (e) => { if (e.target === overlay) cerrarCheckout(); };
}

if (form) {
    form.onsubmit = manejarEnvio;
}

function abrirCheckout() {
    if (!overlay || getCart().length === 0) return;

    if (!estaLogueado()) {
        window.location.href = 'login.html?redirect=carrito.html';
        return;
    }

    const user = usuarioActual();
    document.getElementById('checkout-nombre').value = user ? user.nombre : '';
    document.getElementById('checkout-email').value = user ? user.email : '';
    document.getElementById('checkout-direccion').value = '';
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.checkout-campo input').forEach(el => el.classList.remove('error'));

    formView.style.display = 'block';
    successView.style.display = 'none';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarCheckout() {
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function manejarEnvio(e) {
    e.preventDefault();

    const nombre = document.getElementById('checkout-nombre').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const direccion = document.getElementById('checkout-direccion').value.trim();

    let valido = true;

    if (!nombre) {
        marcarError('checkout-nombre', 'El nombre es obligatorio');
        valido = false;
    }
    if (!email) {
        marcarError('checkout-email', 'El correo es obligatorio');
        valido = false;
    }
    if (!direccion) {
        marcarError('checkout-direccion', 'La dirección es obligatoria');
        valido = false;
    }

    if (!valido) return;

    successNombre.textContent = nombre;
    formView.style.display = 'none';
    successView.style.display = 'block';

    const carrito = getCart();
    const total = carrito.reduce((sum, p) => sum + parseFloat(p.precio) * p.cantidad, 0);
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidos.unshift({
        id: Date.now().toString(),
        fecha: new Date().toLocaleDateString('es-ES'),
        nombre,
        email,
        direccion,
        productos: carrito.map(p => ({ nombre: p.productName, cantidad: p.cantidad, precio: p.precio })),
        total: (total + GASTOS_ENVIO).toFixed(2)
    });
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    setTimeout(() => {
        localStorage.removeItem('carrito');
        window.location.href = '../index.html';
    }, 2000);
}

function marcarError(inputId, msg) {
    const input = document.getElementById(inputId);
    const errorMsg = input.parentElement.querySelector('.error-msg');
    input.classList.add('error');
    if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.classList.add('visible');
    }
}