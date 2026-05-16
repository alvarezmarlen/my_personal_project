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
export function mostrarCategorias(listaCategorias, idCategorias) {
    const contenedor = document.getElementById(idCategorias);
    if (!contenedor) return; // Seguridad
    
    contenedor.innerHTML = "";    
    contenedor.classList.add('mosaico-container');

    listaCategorias.forEach(item => {
        const link = document.createElement('a');
        link.classList.add('tarjeta');
        link.href = item.enlace;
        
        link.innerHTML = `
            <img src="${item.imagen}" alt="${item.categoria}">
                <div class="etiqueta-contenedor">
                    <h3>${item.categoria}</h3>
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
            <img src="${prod.imagen}" alt="${prod.productName}">
            <h5>${prod.productName}</h5>
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
    contenedor.innerHTML = ""; // Limpiamos por si hay algo antes

    listaProductos.forEach(producto => {
    const card = document.createElement('a');
    card.classList.add('producto-card');

    card.innerHTML = `
        <div class="producto-imagen">
                <img src="${producto.imagen}" alt="${producto.productName}">
        </div>
        <div class="producto-info">
            <h3>${producto.productName}</h3>
              <p class="precio">${producto.precio}€</p>
            <button class="btn-comprar" data-id="${producto.id}">Añadir a la cesta</button>
        </div>
    `;
        contenedor.appendChild(card);
    });
}
