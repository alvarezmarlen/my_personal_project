//1. CODIGO QUE RENDERIZA AL NAV Y EL FOOTER
export async function cargarComponentes(idContenedor, rutaArchivo) {
    try {
        const respuesta = await fetch(rutaArchivo);
        if (respuesta.ok) {

            // Aquí no usamos .json(), sino .text() porque es código HTML
            const html = await respuesta.text();
            document.getElementById(idContenedor).innerHTML = html;
        } else {
            console.error("Error al buscar el archivo:", respuesta.status);
        }
    } catch (error) {
        console.error("No se pudo cargar el componente:", error);
    }
}

/* ---------------------------------------------------------
   2. PINTAR LAS CATEGORIAS EN EL INICIO
-----------------------------------------------------------*/
const CATEGORY_IMAGES = {
    "Pendientes": "assets/img/catalogo/pendientesCrucifijos1.png",
    "Collares": "assets/img/catalogo/CollarFrutilla-abalorios02.png",
    "Pulseras": "assets/img/catalogo/PulseraCruz01.png",
    "Colgantes para móvil": "assets/img/catalogo/ColganteMovil-Murcielago8.png",
    "Llaveros": "assets/img/catalogo/LlaveroPucca01.png"
};

export function mostrarCategorias(listaCategorias, idCategorias) {
    const contenedor = document.getElementById(idCategorias);
    if (!contenedor) return; // Seguridad
    
    contenedor.innerHTML = "";    
    contenedor.classList.add('mosaico-container');

    listaCategorias.forEach(item => {
        const link = document.createElement('a');
        link.classList.add('tarjeta');
        link.href = `pages/productos.html?categoria=${item.id}`;
        
        link.innerHTML = `
            ${(item.imagen || CATEGORY_IMAGES[item.nombre]) ? `<img src="${item.imagen || CATEGORY_IMAGES[item.nombre]}" alt="${item.nombre}" loading="lazy">` : ''}
                <div class="etiqueta-contenedor">
                    <h3>${item.nombre}</h3>
                </div>
        `;
    contenedor.appendChild(link);
    });
}



/* ---------------------------------------------------------
   3.  PINTAR FAVORITOS EN EL INICIO
-----------------------------------------------------------*/
export function mostrarMasVisitados(listaProductos, idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    // 1. Algoritmo: Ordenar por clics y tomar los 3 mejores
    const destacados = [...listaProductos]
        .sort((a, b) => (b.clics || 0) - (a.clics || 0))
        .slice(0, 3);
    
    // 2. Limpiar y Pintar
    contenedor.innerHTML = "";
    
    destacados.forEach(prod => {
        // 1. Creamos el contenedor principal del producto
        const tarjeta = document.createElement('a');
        tarjeta.className = "producto-mini"; // Clase exacta de tu CSS 🏷️
        tarjeta.href = `pages/detalle.html?id=${prod.id}`

        // 2. Insertamos la estructura interna
        tarjeta.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}" loading="lazy">
            <h5>${prod.nombre}</h5>
            <span>${prod.precio.toFixed(2)}€</span>
        `;
        
        // 3. Lo añadimos al grid
        contenedor.appendChild(tarjeta);
    });
}

/* ---------------------------------------------------------
    4. PINTAR LAS TARJETAS DE PRODUCTOS 
-----------------------------------------------------------*/
export function mostrarProductos(listaProductos, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (listaProductos.length === 0) {
        contenedor.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:60px 0;color:#999;">No se encontraron productos.</p>';
        return;
    }

    listaProductos.forEach(producto => {
    const card = document.createElement('a');
    const sinStock = producto.stock <= 0;
    card.classList.add('producto-card');
    card.href = `detalle.html?id=${producto.id}`

    card.innerHTML = `
        <div class="producto-imagen">
                <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
        </div>
        <div class="producto-info">
            <h3>${producto.nombre}</h3>
              <p class="precio">${producto.precio.toFixed(2)}€</p>
            <button data-id="${producto.id}"
                type='button'
                class="btn-comprar${sinStock ? ' btn-sin-stock' : ''}"
                data-label="${producto.nombre}"
                data-price="${producto.precio}"
                data-image="${producto.imagen}"
                ${sinStock ? 'disabled' : ''}
                >${sinStock ? 'SIN STOCK' : 'Añadir a la cesta'}</button>
        </div>
    `;
        contenedor.appendChild(card);
    });
}


/* ---------------------------------------------------------
    5. PINTAR LAS TARJETAS DE DETALLES 
-----------------------------------------------------------*/
export function inicializarVolverArriba() {
    const btn = document.createElement('button');
    btn.id = 'btn-volver-arriba';
    btn.textContent = '↑';
    btn.style.cssText = `
        position:fixed; bottom:30px; right:30px; width:44px; height:44px;
        background:#3c122c; color:#fff; border:none; border-radius:50%;
        font-size:1.2rem; cursor:pointer; z-index:9998;
        box-shadow:0 4px 15px rgba(0,0,0,0.15);
        opacity:0; transform:translateY(20px);
        transition:opacity 0.3s, transform 0.3s;
        pointer-events:none;
    `;
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
            btn.style.pointerEvents = 'auto';
        } else {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(20px)';
            btn.style.pointerEvents = 'none';
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

export function mostrarToast(mensaje, tipo = 'exito') {
    const existing = document.querySelector('.toast-global');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-global';
    toast.textContent = mensaje;
    toast.style.cssText = `
        position:fixed; bottom:30px; left:50%; transform:translateX(-50%) translateY(20px);
        background:${tipo === 'exito' ? '#00b090' : '#555'}; color:#fff;
        padding:14px 28px; border-radius:8px; font-family:Montserrat,sans-serif;
        font-size:0.95rem; font-weight:600; z-index:99999;
        box-shadow:0 4px 20px rgba(0,0,0,0.15);
        opacity:0; transition:opacity 0.3s, transform 0.3s;
        pointer-events:none;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function mostrarDetalle(producto, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = ""; // Limpiamos por si hay algo antes
    
    //Creamos la tarjeta directamente para este producto.
    const detalle = document.createElement('div');
    detalle.classList.add('producto-detalle');

    const sinStock = producto.stock <= 0;
    detalle.innerHTML = `
        <div class="producto-imagen">
            <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
        </div>
        <div class="producto-info">
            <h3>${producto.nombre}</h3>
            <p class="precio">${producto.precio.toFixed(2)}€</p>
            <p class="producto-stock" style="color:${sinStock ? '#cc0000' : '#2e7d32'}">${sinStock ? '🔴 Sin stock' : `🟢 Stock: ${producto.stock}`}</p>

            <button data-id="${producto.id}"
                type='button'
                class="btn-comprar${sinStock ? ' btn-sin-stock' : ''}"
                data-label="${producto.nombre}"
                data-price="${producto.precio}"
                data-image="${producto.imagen}"
                ${sinStock ? 'disabled' : ''}
                >${sinStock ? 'SIN STOCK' : 'Añadir a la cesta'}</button>
            <div class="producto-detalles-adicionales">
                <p class="producto-descripcion">${producto.descripcion || 'Sin descripción disponible.'}</p>
                <p class="producto-materiales"><strong>Materiales:</strong> ${producto.materiales || 'No especificados.'}</p>
            </div>
        </div>
    `;
        contenedor.appendChild(detalle);    
}
