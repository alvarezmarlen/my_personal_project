import { api } from "./api.js"; // ← Importamos el asistente inteligente de la API
import { actualizarContadorNav } from "./nav.js";
import { getCart, setCart, saveCart } from "./cartState.js";
import { estaLogueado, usuarioActual } from "./auth.js";

function escapar(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

const GASTOS_ENVIO = 4.90;

// Convertimos a async porque obtener los datos del carrito puede requerir consultar a Flask
export async function renderizarCarrito() {
    const carrito = await getCart(); // ← Ahora lleva 'await'
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
        // Adaptación técnica: la API puede devolver 'producto_id' o 'id'
        const idProducto = producto.id || producto.producto_id;
        const subtotalProducto = parseFloat(producto.precio) * producto.cantidad;
        totalAcumulado += subtotalProducto;

        let rutaImagen = producto.imagen || producto.img || '';

        contenedorProductos.innerHTML += `
            <div class="tarjeta-producto-carrito" data-id="${escapar(idProducto)}">
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

async function gestionarBotonPago() {
    const btnPagar = document.querySelector('.btn-pagar');
    if (!btnPagar) return;
    const carrito = await getCart();
    const vacio = carrito.length === 0;
    btnPagar.disabled = vacio;
    btnPagar.style.opacity = vacio ? '0.5' : '1';
    btnPagar.style.cursor = vacio ? 'not-allowed' : 'pointer';
}

function asignarEventosBotones() {
    // ➕ Botón Más Cantidad
    document.querySelectorAll('.btn-mas').forEach(boton => {
        boton.onclick = async (e) => {
            const carrito = await getCart();
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => (item.id || item.producto_id) == id);
            
            if (producto) {
                producto.cantidad++;
                if (estaLogueado()) {
                    try {
                        // Sincronizamos con el endpoint PUT /api/carrito/<id> de Flask
                        await api.updateCarrito(id, { cantidad: producto.cantidad });
                    } catch (err) { console.error("Error al actualizar cantidad en el servidor:", err); }
                }
                guardarYRefrescar();
            }
        };
    });

    // ➖ Botón Menos Cantidad
    document.querySelectorAll('.btn-menos').forEach(boton => {
        boton.onclick = async (e) => {
            const carrito = await getCart();
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => (item.id || item.producto_id) == id);
            
            if (producto && producto.cantidad > 1) {
                producto.cantidad--;
                if (estaLogueado()) {
                    try {
                        // Sincronizamos con el endpoint PUT /api/carrito/<id> de Flask
                        await api.updateCarrito(id, { cantidad: producto.cantidad });
                    } catch (err) { console.error("Error al restar cantidad en el servidor:", err); }
                }
                guardarYRefrescar();
            }
        };
    });

    // 🗑️ Botón Eliminar Producto
    document.querySelectorAll('.btn-eliminar').forEach(boton => {
        boton.onclick = async (e) => {
            let carrito = await getCart();
            const tarjeta = e.target.closest('.tarjeta-producto-carrito');
            const id = tarjeta.dataset.id;
            const producto = carrito.find(item => (item.id || item.producto_id) == id);

            if (confirm(`¿Seguro que deseas quitar "${producto.productName}" de tu cesta?`)) {
                if (estaLogueado()) {
                    try {
                        // Sincronizamos con el endpoint DELETE /api/carrito/<id> de Flask
                        await api.deleteCarrito(id);
                    } catch (err) { console.error("Error al eliminar producto en el servidor:", err); }
                }
                carrito = carrito.filter(item => (item.id || item.producto_id) != id);
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

// Vinculación de botones del DOM
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

if (closeBtn) { closeBtn.onclick = cerrarCheckout; }
if (overlay) { overlay.onclick = (e) => { if (e.target === overlay) cerrarCheckout(); }; }
if (form) { form.onsubmit = manejarEnvio; }

async function abrirCheckout() {
    const carrito = await getCart();
    if (!overlay || carrito.length === 0) return;

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

// 📦 SUBMIT: Finalizar la compra creando el pedido real en la Base de Datos
async function manejarEnvio(e) {
    e.preventDefault();

    const nombre = document.getElementById('checkout-nombre').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const direccion = document.getElementById('checkout-direccion').value.trim();

    let valido = true;

    if (!nombre) { marcarError('checkout-nombre', 'El nombre es obligatorio'); valido = false; }
    if (!email) { marcarError('checkout-email', 'El correo es obligatorio'); valido = false; }
    if (!direccion) { marcarError('checkout-direccion', 'La dirección es obligatoria'); valido = false; }

    if (!valido) return;

    try {
        // Enviar pedido real a la API de Flask en Docker
        await api.crearPedido({
            direccion_envio: direccion
        });

        successNombre.textContent = nombre;
        formView.style.display = 'none';
        successView.style.display = 'block';

        // Limpiamos el carrito local al completarse con éxito
        localStorage.removeItem('carrito');

        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);

    } catch (error) {
        console.error("No se pudo crear el pedido en el servidor:", error);
        alert(error.message || 'Error al procesar el pedido con el servidor.');
    }
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