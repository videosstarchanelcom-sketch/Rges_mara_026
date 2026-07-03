// 1. Configura tus credenciales de Supabase
const SUPABASE_URL = "TU_SUPABASE_URL_AQUI";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY_AQUI";

// 2. Inicializa el cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. Función de ejemplo para obtener datos al cargar la página
async function obtenerDatos() {
    const container = document.getElementById('data-container');
    
    // Cambia 'tu_tabla' por el nombre real de tu tabla en Supabase
    const { data, error } = await supabase
        .from('tu_tabla') 
        .select('*');

    if (error) {
        console.error("Error al obtener datos:", error);
        container.innerText = "Hubo un error al cargar los datos.";
        return;
    }

    // Mostrar los datos en el HTML
    container.innerText = JSON.stringify(data, null, 2);
}

// Ejecutar la función
obtenerDatos();