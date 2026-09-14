// =================================================================
// history.js · Módulo de historial de cambios (audit_logs)
// =================================================================

// ---------- 1. CONFIGURACIÓN SUPABASE ----------
const SUPABASE_URL = 'https://mveqwpsmgtvlmzdcbxkj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12ZXF3cHNtZ3R2bG16ZGNieGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwODA4NzAsImV4cCI6MjA5ODY1Njg3MH0.JKecCwzBgS7cePVJVEhWnmLIGgcwunz-lU16EeRmeUY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------- 2. REFERENCIAS DOM ----------
const $ = (sel) => document.querySelector(sel);

const historyContainer = $('#historyContainer');
const searchInput = $('#searchInput');
const actionFilter = $('#actionFilter');
const userFilter = $('#userFilter');
const recordCount = $('#recordCount');
const refreshBtn = $('#refreshBtn');
const lastUpdate = $('#lastUpdate');
const toastContainer = $('#toastContainer');

// ---------- 3. ESTADO GLOBAL ----------
let allLogs = [];
let filteredLogs = [];

// ---------- 4. TOASTS ----------
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconMap = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `<span>${iconMap[type] || 'ℹ️'}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ---------- 5. UTILIDADES ----------
function escHtml(str) {
    if (str === null || str === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(str).replace(/[&<>"']/g, m => map[m]);
}

function formatDateTime(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        return d.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return iso;
    }
}

function formatValue(val) {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
}

// Traducir nombres de campos a etiquetas legibles
const FIELD_LABELS = {
    nombre: 'Nombre',
    cedula_escolar: 'Cédula Escolar',
    fecha_nac: 'Fecha Nac.',
    edad: 'Edad',
    lugar_nac: 'Lugar Nac.',
    sexo: 'Sexo',
    indigena: 'Indígena',
    grado: 'Grado',
    seccion: 'Sección',
    representante: 'Representante',
    cedula_rep: 'Cédula Rep.',
    created_at: 'Creado',
    id: 'ID'
};

function labelField(field) {
    return FIELD_LABELS[field] || field;
}

// ---------- 6. CARGAR LOGS ----------
async function fetchLogs() {
    try {
        // Verificar sesión activa
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData?.session) {
            showToast('Sesión expirada. Redirigiendo...', 'warning');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            return;
        }

        historyContainer.innerHTML = `
            <div class="loading-state">
                <span class="spinner"></span>
                <p>Cargando historial...</p>
            </div>
        `;

        const { data, error } = await supabaseClient
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);

        if (error) throw error;

        allLogs = data || [];
        populateUserFilter(allLogs);
        applyFilters();
        lastUpdate.textContent = `Última actualización: ${formatDateTime(new Date().toISOString())}`;
    } catch (err) {
        console.error('Error al cargar logs:', err);
        historyContainer.innerHTML = `
            <div class="empty-state">
                <span>⚠️</span>
                <h3>Error al cargar el historial</h3>
                <p style="font-size:14px; color:#94a3b8;">${escHtml(err.message || 'Intenta de nuevo.')}</p>
            </div>
        `;
        showToast('Error al cargar historial: ' + err.message, 'error');
    }
}

// ---------- 7. POBLAR FILTRO DE USUARIOS ----------
function populateUserFilter(logs) {
    const users = [...new Set(logs.map(l => l.user_email).filter(Boolean))].sort();
    const current = userFilter.value;

    userFilter.innerHTML = '<option value="">Todos</option>';
    users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.textContent = u;
        userFilter.appendChild(opt);
    });

    if (current && users.includes(current)) {
        userFilter.value = current;
    }
}

// ---------- 8. APLICAR FILTROS ----------
function applyFilters() {
    const term = searchInput.value.toLowerCase().trim();
    const action = actionFilter.value;
    const user = userFilter.value;

    filteredLogs = allLogs.filter(log => {
        // Filtro por acción
        if (action && log.action !== action) return false;

        // Filtro por usuario
        if (user && log.user_email !== user) return false;

        // Filtro por texto (nombre, cédula, usuario, campos)
        if (term) {
            const nombre = log.new_data?.nombre || log.old_data?.nombre || '';
            const cedula = log.new_data?.cedula_escolar || log.old_data?.cedula_escolar || '';
            const userEmail = log.user_email || '';
            const recordId = log.record_id || '';
            const haystack = `${nombre} ${cedula} ${userEmail} ${recordId}`.toLowerCase();
            if (!haystack.includes(term)) return false;
        }

        return true;
    });

    renderLogs(filteredLogs);
}

// ---------- 9. RENDERIZAR LOGS ----------
function renderLogs(logs) {
    recordCount.textContent = `${logs.length} registro${logs.length !== 1 ? 's' : ''}`;

    if (!logs.length) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <span>📭</span>
                <h3>No hay registros que coincidan</h3>
                <p style="font-size:14px; color:#94a3b8;">Ajusta los filtros o realiza cambios en la base de datos.</p>
            </div>
        `;
        return;
    }

    let html = '';
    logs.forEach((log, idx) => {
        html += renderLogItem(log, idx);
    });
    historyContainer.innerHTML = html;
}

function renderLogItem(log, idx) {
    const action = log.action || 'UNKNOWN';
    const actionClass = action.toLowerCase();
    const actionLabels = {
        INSERT: '➕ Insertado',
        UPDATE: '✏️ Actualizado',
        DELETE: '🗑️ Eliminado'
    };
    const actionLabel = actionLabels[action] || action;

    const nombre =
        log.new_data?.nombre ||
        log.old_data?.nombre ||
        '(registro sin nombre)';

    const changesHtml = renderChanges(log, action);

    // Retraso de animación por índice (máx 300ms)
    const delay = Math.min(idx * 30, 300);

    return `
        <div class="history-item action-${actionClass}" style="animation-delay:${delay}ms">
            <div class="item-header">
                <div class="item-left">
                    <span class="action-badge ${actionClass}">${actionLabel}</span>
                    <span class="item-name">${escHtml(nombre)}</span>
                    <span class="item-id" title="ID del registro">${escHtml(log.record_id || '')}</span>
                </div>
                <div class="item-meta">
                    <span class="item-user">👤 ${escHtml(log.user_email || 'Sistema')}</span>
                    <span>🕒 ${formatDateTime(log.created_at)}</span>
                </div>
            </div>
            ${changesHtml}
        </div>
    `;
}

function renderChanges(log, action) {
    const oldData = log.old_data || {};
    const newData = log.new_data || {};

    if (action === 'INSERT') {
        // Mostrar campos insertados
        const entries = Object.entries(newData)
            .filter(([k]) => k !== 'id' && k !== 'created_at' && newData[k] !== null && newData[k] !== '');
        if (!entries.length) return '';
        return `
            <div class="item-changes">
                ${entries.map(([k, v]) => `
                    <div class="change-row">
                        <span class="change-field">${escHtml(labelField(k))}:</span>
                        <span class="change-single">${escHtml(formatValue(v))}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (action === 'DELETE') {
        const entries = Object.entries(oldData)
            .filter(([k]) => k !== 'id' && k !== 'created_at' && oldData[k] !== null && oldData[k] !== '');
        if (!entries.length) return '';
        return `
            <div class="item-changes">
                ${entries.map(([k, v]) => `
                    <div class="change-row">
                        <span class="change-field">${escHtml(labelField(k))}:</span>
                        <span class="change-old">${escHtml(formatValue(v))}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (action === 'UPDATE') {
        // Comparar campo por campo
        const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
        const changes = [];

        allKeys.forEach(k => {
            if (k === 'id' || k === 'created_at') return;
            const oldV = oldData[k];
            const newV = newData[k];
            if (JSON.stringify(oldV) !== JSON.stringify(newV)) {
                changes.push({ field: k, oldV, newV });
            }
        });

        if (!changes.length) {
            return `<div class="item-changes"><div class="change-row"><span class="change-single">Sin cambios detectados</span></div></div>`;
        }

        return `
            <div class="item-changes">
                ${changes.map(c => `
                    <div class="change-row">
                        <span class="change-field">${escHtml(labelField(c.field))}:</span>
                        <span class="change-old">${escHtml(formatValue(c.oldV))}</span>
                        <span class="change-arrow">→</span>
                        <span class="change-new">${escHtml(formatValue(c.newV))}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    return '';
}

// ---------- 10. EVENTOS ----------
searchInput.addEventListener('input', applyFilters);
actionFilter.addEventListener('change', applyFilters);
userFilter.addEventListener('change', applyFilters);
refreshBtn.addEventListener('click', fetchLogs);

// ---------- 11. INICIO ----------
document.addEventListener('DOMContentLoaded', () => {
    fetchLogs();
});
