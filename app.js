// =================================================================
// =================================================================
const SUPABASE_URL = 'https://tu-proyecto.supabase.co'; // 
const SUPABASE_ANON_KEY = 'tu-anon-key-aqui'; // 

// =================================================================
// =================================================================
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =================================================================
// =================================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const loginView = $('#loginView');
const appView = $('#appView');
const loginForm = $('#loginForm');
const loginEmail = $('#loginEmail');
const loginPassword = $('#loginPassword');
const loginBtn = $('#loginBtn');
const loginBtnText = $('#loginBtnText');
const loginBtnSpinner = $('#loginBtnSpinner');
const logoutBtn = $('#logoutBtn');
const userBadge = $('#userBadge');

const studentsBody = $('#studentsTableBody');
const searchInput = $('#searchInput');
const addStudentBtn = $('#addStudentBtn');
const statTotal = $('#statTotal');
const statV = $('#statV');
const statH = $('#statH');
const statIndigena = $('#statIndigena');
const statIndigenaDetalle = $('#statIndigenaDetalle');
const statDisgregada = $('#statDisgregada');
const resumenText = $('#resumenText');

// Modal
const modal = $('#studentModal');
const modalBox = $('#modalBox');
const modalTitle = $('#modalTitle');
const modalCloseBtn = $('#modalCloseBtn');
const modalCancelBtn = $('#modalCancelBtn');
const studentForm = $('#studentForm');
const editId = $('#editId');
const sNombre = $('#sNombre');
const sCedulaEscolar = $('#sCedulaEscolar');
const sFechaNac = $('#sFechaNac');
const sEdad = $('#sEdad');
const sLugarNac = $('#sLugarNac');
const sSexo = $('#sSexo');
const sIndigena = $('#sIndigena');
const sRepresentante = $('#sRepresentante');
const sCedulaRep = $('#sCedulaRep');
const modalSaveBtn = $('#modalSaveBtn');
const modalSaveText = $('#modalSaveText');
const modalSaveSpinner = $('#modalSaveSpinner');

// =================================================================
// =================================================================
function showToast(message, type = 'info') {
    const container = $('#toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    toast.innerHTML = `<span>${iconMap[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// =================================================================
// =================================================================
async function handleLogin(e) {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    if (!email || !password) {
        showToast('Ingresa correo y contraseña.', 'warning');
        return;
    }
    loginBtn.disabled = true;
    loginBtnText.textContent = 'Verificando...';
    loginBtnSpinner.classList.remove('hidden');

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        if (data?.user) {
            showToast('Bienvenido, acceso concedido ✅', 'success');
            await loadApp();
        } else {
            throw new Error('No se pudo iniciar sesión.');
        }
    } catch (err) {
        showToast('Error: ' + (err.message || 'Credenciales inválidas.'), 'error');
        loginBtn.disabled = false;
        loginBtnText.textContent = 'Ingresar';
        loginBtnSpinner.classList.add('hidden');
    }
}

async function handleLogout() {
    try {
        await supabaseClient.auth.signOut();
        showToast('Sesión cerrada.', 'info');
        loginView.classList.remove('hidden');
        appView.classList.add('hidden');
        loginBtn.disabled = false;
        loginBtnText.textContent = 'Ingresar';
        loginBtnSpinner.classList.add('hidden');
        loginEmail.value = '';
        loginPassword.value = '';
    } catch (err) {
        showToast('Error al cerrar sesión.', 'error');
    }
}

// =================================================================
// =================================================================
let allStudents = [];

async function fetchStudents() {
    try {
        const { data, error } = await supabaseClient
            .from('alumnos')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        allStudents = data || [];
        return allStudents;
    } catch (err) {
        showToast('Error al cargar alumnos: ' + err.message, 'error');
        return [];
    }
}

// =================================================================
// =================================================================
function renderStudents(list) {
    const data = list || allStudents;
    if (!data.length) {
        studentsBody.innerHTML = `
            <tr><td colspan="9">
                <div class="empty-state">
                    <span>📚</span>
                    <h3>No hay alumnos registrados</h3>
                    <p style="font-size:14px; color:#94a3b8;">Presiona "Nuevo Alumno" para agregar.</p>
                </div>
            </td></tr>
        `;
        updateStats(data);
        return;
    }

    let html = '';
    data.forEach((s, idx) => {
        const num = idx + 1;
        const fecha = s.fecha_nac ? formatDate(s.fecha_nac) : '—';
        const edad = s.edad || '—';
        const sexo = s.sexo || '—';
        const indigena = s.indigena || '';
        const indBadge = indigena ? `<span class="badge badge-indigena">${indigena}</span>` : '—';
        const sexoBadge = sexo !== '—' ? `<span class="badge badge-sexo">${sexo}</span>` : '—';

        html += `
            <tr>
                <td><strong>${num}</strong></td>
                <td><strong>${escHtml(s.nombre)}</strong></td>
                <td>${escHtml(s.cedula_escolar || '')}</td>
                <td>${fecha}</td>
                <td>${edad}</td>
                <td>${sexoBadge}</td>
                <td>${indBadge}</td>
                <td>${escHtml(s.representante || '')}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${s.id}">✏️</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${s.id}">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
    studentsBody.innerHTML = html;
    updateStats(data);

    // Eventos botones edit/delete
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => handleDelete(btn.dataset.id));
    });
}

function updateStats(data) {
    const total = data.length;
    const varones = data.filter(s => s.sexo === 'V').length;
    const hembras = data.filter(s => s.sexo === 'H').length;
    const indigenas = data.filter(s => s.indigena && s.indigena !== '').length;
    const wayuu = data.filter(s => s.indigena === 'Wayuu').length;
    const indV = data.filter(s => s.indigena === 'Wayuu' && s.sexo === 'V').length;
    const indH = data.filter(s => s.indigena === 'Wayuu' && s.sexo === 'H').length;
    const disV = data.filter(s => s.sexo === 'V').length;
    const disH = data.filter(s => s.sexo === 'H').length;

    statTotal.textContent = total;
    statV.textContent = varones;
    statH.textContent = hembras;
    statIndigena.textContent = indigenas;
    statIndigenaDetalle.textContent = `V: ${indV} · H: ${indH}`;
    statDisgregada.textContent = `V: ${disV} · H: ${disH}`;

    resumenText.textContent =
        `Matrícula Indígena: Wayuu V: ${indV} H: ${indH} T: ${indV + indH} niños · ` +
        `Matrícula disgregada V: ${disV} H: ${disH} T: ${disV + disH} niños`;
}

// =================================================================
// =================================================================
async function saveStudent(data) {
    const id = data.id || null;
    const payload = {
        nombre: data.nombre.trim(),
        cedula_escolar: data.cedula_escolar.trim(),
        fecha_nac: data.fecha_nac,
        edad: data.edad ? parseInt(data.edad) : null,
        lugar_nac: data.lugar_nac ? data.lugar_nac.trim() : '',
        sexo: data.sexo,
        indigena: data.indigena || '',
        representante: data.representante.trim(),
        cedula_rep: data.cedula_rep ? data.cedula_rep.trim() : '',
    };

    try {
        let result;
        if (id) {
            // Actualizar
            result = await supabaseClient
                .from('alumnos')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
        } else {
            // Insertar
            result = await supabaseClient
                .from('alumnos')
                .insert(payload)
                .select()
                .single();
        }
        if (result.error) throw result.error;
        showToast(id ? 'Alumno actualizado ✅' : 'Alumno agregado ✅', 'success');
        await refreshData();
        return result.data;
    } catch (err) {
        showToast('Error al guardar: ' + err.message, 'error');
        throw err;
    }
}

async function handleDelete(id) {
    if (!confirm('¿Eliminar este alumno permanentemente?')) return;
    try {
        const { error } = await supabaseClient
            .from('alumnos')
            .delete()
            .eq('id', id);
        if (error) throw error;
        showToast('Alumno eliminado.', 'success');
        await refreshData();
    } catch (err) {
        showToast('Error al eliminar: ' + err.message, 'error');
    }
}

// =================================================================
// =================================================================
async function refreshData() {
    await fetchStudents();
    const filtered = filterStudents(allStudents);
    renderStudents(filtered);
}

function filterStudents(list) {
    const term = searchInput.value.toLowerCase().trim();
    if (!term) return list;
    return list.filter(s =>
        (s.nombre || '').toLowerCase().includes(term) ||
        (s.cedula_escolar || '').toLowerCase().includes(term) ||
        (s.representante || '').toLowerCase().includes(term)
    );
}

// =================================================================
// =================================================================
function openModal(title, data = null) {
    modalTitle.textContent = title;
    editId.value = data?.id || '';
    sNombre.value = data?.nombre || '';
    sCedulaEscolar.value = data?.cedula_escolar || '';
    sFechaNac.value = data?.fecha_nac || '';
    calcularEdad();
    sLugarNac.value = data?.lugar_nac || '';
    sSexo.value = data?.sexo || '';
    sIndigena.value = data?.indigena || '';
    sRepresentante.value = data?.representante || '';
    sCedulaRep.value = data?.cedula_rep || '';
    modal.classList.remove('hidden');
    modalBox.classList.remove('closing');
    modalBox.style.animation = 'slideUp 0.3s ease';
    // focus
    setTimeout(() => sNombre.focus(), 100);
}

function closeModal() {
    modalBox.classList.add('closing');
    modalBox.style.animation = 'slideDown 0.2s ease forwards';
    setTimeout(() => {
        modal.classList.add('hidden');
        modalBox.classList.remove('closing');
        studentForm.reset();
        editId.value = '';
        sEdad.value = '';
        modalSaveBtn.disabled = false;
        modalSaveText.textContent = 'Guardar';
        modalSaveSpinner.classList.add('hidden');
    }, 200);
}

function openEditModal(id) {
    const student = allStudents.find(s => s.id === id);
    if (!student) {
        showToast('Alumno no encontrado.', 'error');
        return;
    }
    openModal('Editar Alumno', student);
}

// =================================================================
// =================================================================
function calcularEdad() {
    const fecha = sFechaNac.value;
    if (!fecha) {
        sEdad.value = '';
        return;
    }
    const hoy = new Date();
    const nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    sEdad.value = edad > 0 ? edad : 0;
}

// =================================================================
// =================================================================
function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateStr; }
}

// =================================================================
// =================================================================
function escHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, m => map[m]);
}

// =================================================================
// =================================================================
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

searchInput.addEventListener('input', () => {
    const filtered = filterStudents(allStudents);
    renderStudents(filtered);
});

addStudentBtn.addEventListener('click', () => openModal('Nuevo Alumno'));

modalCloseBtn.addEventListener('click', closeModal);
modalCancelBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

sFechaNac.addEventListener('change', calcularEdad);
sFechaNac.addEventListener('input', calcularEdad);

studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editId.value || null;
    const nombre = sNombre.value.trim();
    const cedula_escolar = sCedulaEscolar.value.trim();
    const fecha_nac = sFechaNac.value;
    const lugar_nac = sLugarNac.value.trim();
    const sexo = sSexo.value;
    const indigena = sIndigena.value;
    const representante = sRepresentante.value.trim();
    const cedula_rep = sCedulaRep.value.trim();

    if (!nombre || !cedula_escolar || !fecha_nac || !sexo || !representante) {
        showToast('Completa todos los campos obligatorios (*).', 'warning');
        return;
    }

    const edad = parseInt(sEdad.value) || null;

    modalSaveBtn.disabled = true;
    modalSaveText.textContent = 'Guardando...';
    modalSaveSpinner.classList.remove('hidden');

    try {
        await saveStudent({
            id,
            nombre,
            cedula_escolar,
            fecha_nac,
            edad,
            lugar_nac,
            sexo,
            indigena,
            representante,
            cedula_rep,
        });
        closeModal();
    } catch (err) {
        // error ya se muestra en toast
    } finally {
        modalSaveBtn.disabled = false;
        modalSaveText.textContent = 'Guardar';
        modalSaveSpinner.classList.add('hidden');
    }
});

// =================================================================
// =================================================================
async function checkSession() {
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        if (data?.session?.user) {
            await loadApp();
        } else {
            loginView.classList.remove('hidden');
            appView.classList.add('hidden');
        }
    } catch (err) {
        loginView.classList.remove('hidden');
        appView.classList.add('hidden');
    }
}

async function loadApp() {
    try {
        // Obtener usuario
        const { data: userData } = await supabaseClient.auth.getUser();
        if (userData?.user?.email) {
            userBadge.textContent = `👤 ${userData.user.email}`;
        }
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        await refreshData();
    } catch (err) {
        showToast('Error al cargar la aplicación.', 'error');
        loginView.classList.remove('hidden');
        appView.classList.add('hidden');
    }
}

// =================================================================
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar login por defecto, app oculta
    loginView.classList.remove('hidden');
    appView.classList.add('hidden');
    checkSession();
});

// Atajo: tecla Escape cierra modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

console.log('✅ Gestión de Matrícula Escolar cargada.');
console.log('🔒 Usando Supabase con RLS. Asegúrate de configurar las políticas.');
