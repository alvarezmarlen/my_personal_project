//Función para obtener datos de cualquier archivo JSON o API
export async function obtenerDatos(url) {
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            throw new Error(`Error al cargar: ${respuesta.status}`);
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Hubo un problema con la petición:", error);
    }
}