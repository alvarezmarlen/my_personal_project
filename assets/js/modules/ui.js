
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

