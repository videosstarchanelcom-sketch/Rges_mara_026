// 1. CONFIGURACIÓN DE CREDENCIALES DE SUPABASE
// Reemplaza con los valores reales de Project URL y anon public key de tu panel de Supabase
const SUPABASE_URL = "TU_SUPABASE_URL_REAL";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY_REAL";

// Inicializamos el cliente global de Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Referencias de Elementos de la Interfaz
const viewCaptcha = document.getElementById("view-captcha");
const viewLogin = document.getElementById("view-login");
const viewDashboard = document.getElementById("view-dashboard");
const flowContainer = document.getElementById("flow-container");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const btnLogout = document.getElementById("btn-logout");

// --- FLUJO DE SEGURIDAD 1: CLOUDFLARE ---
// Esta función se ejecuta sola cuando Turnstile aprueba al usuario
function onCaptchaSuccess(token) {
    console.log("Cloudflare Turnstile verificado.");
    // Ocultamos la vista de Captcha y pasamos al Login
    viewCaptcha.classList.add("hidden");
    
    // Verificamos si el usuario ya tenía una sesión iniciada previamente en este navegador
    comprobarSesionExistente();
}

// --- FLUJO DE SEGURIDAD 2: MANEJO DE SESIÓN CON SUPABASE ---
async function comprobarSesionExistente() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        mostrarDashboard();
    } else {
        viewLogin.classList.remove("hidden");
    }
}

// Evento de Envío del Formulario de Login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.innerText = "";
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const btn = document.getElementById("btn-login");
    
    btn.innerText = "Verificando...";
    btn.disabled = true;

    // Conexión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginError.innerText = "Acceso denegado: " + error.message;
        btn.innerText = "Ingresar al Panel";
        btn.disabled = false;
    } else {
        console.log("Sesión iniciada correctamente:", data.user.email);
        mostrarDashboard();
    }
});

// Función para cambiar a la vista del Dashboard Protegido
function mostrarDashboard() {
    viewLogin.classList.add("hidden");
    viewCaptcha.classList.add("hidden");
    
    // Expandimos el contenedor para que luzca como un panel amplio
    flowContainer.classList.remove("container");
    flowContainer.style.maxWidth = "800px";
    flowContainer.style.width = "100%;";
    
    viewDashboard.classList.remove("hidden");
    
    // Aquí puedes llamar a tus funciones para traer datos de Supabase, ej: cargarTablas();
    cargarDatosDePrueba();
}

// Evento de Cierre de Sesión
btnLogout.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Recarga la página para volver a foja cero con las verificaciones
});

// Función de ejemplo para extraer datos simulando el uso de tablas reales
async function cargarDatosDePrueba() {
    const display = document.getElementById("data-display");
    
    /* 
    Cuando tengas tus tablas listas en Supabase con RLS activo, usarás algo como esto:
    const { data, error } = await supabase.from('tus_tablas').select('*');
    */
    
    display.innerHTML = `// Conexión segura establecida.<br>// Listo para mapear consultas a tus tablas de Supabase.`;
}