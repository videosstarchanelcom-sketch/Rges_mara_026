// ============================================================
// export.js - Módulo de exportación avanzado (8 formatos)
// ============================================================

// ============================================================
// 1. CONFIGURACIÓN INSTITUCIONAL (para encabezados)
// ============================================================
const SCHOOL_CONFIG = {
    name: '',  // ← VACÍO para que el usuario complete
    code: '',
    address: '',
    phone: '',
    email: '',
    academicYear: '2025-2026',
    grade: '',  // ← VACÍO
    section: '', // ← VACÍO
    shift: ''
};

// ============================================================
// 2. UTILIDADES
// ============================================================
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function escHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, m => map[m]);
}

function getSchoolHeader() {
    return `${SCHOOL_CONFIG.name}\n` +
           `Año Escolar ${SCHOOL_CONFIG.academicYear} · ${SCHOOL_CONFIG.grade}° Grado "${SCHOOL_CONFIG.section}"\n` +
           `Turno: ${SCHOOL_CONFIG.shift}\n` +
           `Tel: ${SCHOOL_CONFIG.phone} · Email: ${SCHOOL_CONFIG.email}\n` +
           `-`.repeat(60);
}

function getCurrentDate() {
    return new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ============================================================
// 3. FORMATO CSV (con encabezado institucional)
// ============================================================
function exportToCSV(data, filename = 'alumnos.csv') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    const headers = ['Nombre', 'Cédula Escolar', 'Fecha Nac.', 'Edad', 'Sexo', 'Indígena', 'Representante', 'Cédula Rep.'];
    const rows = data.map(s => [
        s.nombre || '',
        s.cedula_escolar || '',
        s.fecha_nac || '',
        s.edad || '',
        s.sexo || '',
        s.indigena || '',
        s.representante || '',
        s.cedula_rep || ''
    ]);

    let csv = '';
    // Encabezado institucional (comentado)
    csv += `# ${SCHOOL_CONFIG.name}\n`;
    csv += `# Año Escolar ${SCHOOL_CONFIG.academicYear} · ${SCHOOL_CONFIG.grade}° Grado "${SCHOOL_CONFIG.section}"\n`;
    csv += `# Generado: ${getCurrentDate()}\n`;
    csv += '# ' + '-'.repeat(50) + '\n';
    // Datos
    csv += headers.join(',') + '\n';
    rows.forEach(row => {
        const escaped = row.map(cell => {
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        });
        csv += escaped.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    showToast('Datos exportados a CSV ✅', 'success');
}

// ============================================================
// 4. FORMATO EXCEL (XLSX)
// ============================================================
async function exportToExcel(data, filename = 'alumnos.xlsx') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        if (typeof XLSX === 'undefined') {
            await loadScript('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js');
        }

        const worksheetData = [
            [SCHOOL_CONFIG.name],
            [`Año Escolar ${SCHOOL_CONFIG.academicYear} · ${SCHOOL_CONFIG.grade}° Grado "${SCHOOL_CONFIG.section}"`],
            [`Generado: ${getCurrentDate()}`],
            [],
            ['Nombre', 'Cédula Escolar', 'Fecha Nac.', 'Edad', 'Sexo', 'Indígena', 'Representante', 'Cédula Rep.']
        ];
        data.forEach(s => {
            worksheetData.push([
                s.nombre || '',
                s.cedula_escolar || '',
                s.fecha_nac || '',
                s.edad || '',
                s.sexo || '',
                s.indigena || '',
                s.representante || '',
                s.cedula_rep || ''
            ]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(wb, ws, 'Alumnos');
        XLSX.writeFile(wb, filename);

        showToast('Datos exportados a Excel ✅', 'success');
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        showToast('Error al exportar a Excel: ' + error.message, 'error');
    }
}

// ============================================================
// 5. FORMATO PDF
// ============================================================
async function exportToPDF(data, filename = 'alumnos.pdf') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        if (typeof window.jspdf === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.plugins === 'undefined' || !window.jspdf.plugins.autoTable) {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.0/jspdf.plugin.autotable.min.js');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'a4');

        // Título institucional
        doc.setFontSize(16);
        doc.text(SCHOOL_CONFIG.name, 14, 18);
        doc.setFontSize(12);
        doc.text(`Año Escolar ${SCHOOL_CONFIG.academicYear} · ${SCHOOL_CONFIG.grade}° Grado "${SCHOOL_CONFIG.section}"`, 14, 26);
        doc.setFontSize(10);
        doc.text(`Turno: ${SCHOOL_CONFIG.shift} · Tel: ${SCHOOL_CONFIG.phone}`, 14, 32);
        doc.text(`Generado: ${getCurrentDate()}`, 14, 38);

        // Tabla
        const tableHeaders = [['Nombre', 'Cédula', 'F.N.', 'Edad', 'Sexo', 'Indígena', 'Representante', 'Cédula Rep.']];
        const tableRows = data.map(s => [
            s.nombre || '',
            s.cedula_escolar || '',
            s.fecha_nac || '',
            s.edad || '',
            s.sexo || '',
            s.indigena || '',
            s.representante || '',
            s.cedula_rep || ''
        ]);

        doc.autoTable({
            head: tableHeaders,
            body: tableRows,
            startY: 44,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 45 },
                1: { cellWidth: 22 },
                2: { cellWidth: 18 },
                3: { cellWidth: 14 },
                4: { cellWidth: 14 },
                5: { cellWidth: 22 },
                6: { cellWidth: 35 },
                7: { cellWidth: 22 }
            }
        });

        // Pie de página
        doc.setFontSize(8);
        doc.text(`Total de alumnos: ${data.length}`, 14, doc.internal.pageSize.height - 8);

        doc.save(filename);
        showToast('Datos exportados a PDF ✅', 'success');
    } catch (error) {
        console.error('Error al exportar a PDF:', error);
        showToast('Error al exportar a PDF: ' + error.message, 'error');
    }
}

// ============================================================
// 6. FORMATO DOCX (Word)
// ============================================================
async // ============================================================
// 6. FORMATO DOCX (Word) - Versión mejorada con HTML
// ============================================================
function exportToDOCX(data, filename = 'alumnos.docx') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        // Construir HTML con estilo para Word
        let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="UTF-8">
            <title>Lista de Alumnos</title>
            <!--[if gte mso 9]>
            <xml>
                <w:WordDocument>
                    <w:View>Print</w:View>
                    <w:Zoom>100</w:Zoom>
                </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
                /* Estilos para Word */
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    margin: 40px;
                    color: #1e293b;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 2px solid #2563eb; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px;
                }
                .header h1 { 
                    font-size: 22pt; 
                    color: #0f3b5e; 
                    margin-bottom: 4px;
                }
                .header .subtitle { 
                    font-size: 14pt; 
                    color: #64748b; 
                }
                .header .info {
                    font-size: 11pt;
                    color: #475569;
                    margin-top: 12px;
                }
                .header .info span { 
                    margin: 0 10px; 
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    font-size: 10pt;
                    margin-top: 20px;
                }
                th { 
                    background: #2563eb; 
                    color: white; 
                    padding: 8px; 
                    text-align: left; 
                    font-weight: bold;
                    border: 1px solid #2563eb;
                }
                td { 
                    padding: 6px 8px; 
                    border: 1px solid #d1d5db;
                }
                tr:nth-child(even) { 
                    background: #f8fafc; 
                }
                .footer { 
                    margin-top: 30px; 
                    padding-top: 20px;
                    border-top: 1px solid #d1d5db;
                    color: #64748b; 
                    font-size: 10pt;
                    text-align: center;
                }
                .badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 9pt;
                    font-weight: bold;
                }
                .badge-indigena { background: #fef3c7; color: #92400e; }
                .badge-sexo { background: #dbeafe; color: #1e40af; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${SCHOOL_CONFIG.name || 'INSTITUCIÓN EDUCATIVA'}</h1>
                <div class="subtitle">Año Escolar ${SCHOOL_CONFIG.academicYear || '2025-2026'}</div>
                <div class="info">
                    <span>📅 ${getCurrentDate()}</span>
                    <span>📞 ${SCHOOL_CONFIG.phone || ''}</span>
                    <span>✉️ ${SCHOOL_CONFIG.email || ''}</span>
                </div>
            </div>
            
            <h2 style="font-size:14pt; color:#0f3b5e; margin-bottom:16px;">📋 Lista de Alumnos</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Cédula Escolar</th>
                        <th>F.N.</th>
                        <th>Edad</th>
                        <th>Sexo</th>
                        <th>Indígena</th>
                        <th>Representante</th>
                        <th>Cédula Rep.</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach((s, i) => {
            const sexoBadge = s.sexo ? `<span class="badge badge-sexo">${s.sexo}</span>` : '—';
            const indBadge = s.indigena ? `<span class="badge badge-indigena">${s.indigena}</span>` : '—';
            html += `
                <tr>
                    <td style="text-align:center;">${i + 1}</td>
                    <td><strong>${escHtml(s.nombre || '')}</strong></td>
                    <td>${escHtml(s.cedula_escolar || '')}</td>
                    <td>${s.fecha_nac || ''}</td>
                    <td style="text-align:center;">${s.edad || ''}</td>
                    <td style="text-align:center;">${sexoBadge}</td>
                    <td style="text-align:center;">${indBadge}</td>
                    <td>${escHtml(s.representante || '')}</td>
                    <td>${escHtml(s.cedula_rep || '')}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <div class="footer">
                <p>Total de alumnos: <strong>${data.length}</strong></p>
                <p>${SCHOOL_CONFIG.name || 'Institución Educativa'} · ${SCHOOL_CONFIG.address || ''}</p>
            </div>
        </body>
        </html>
        `;

        // Crear archivo DOCX (Word acepta HTML con el header adecuado)
        const blob = new Blob([html], { 
            type: 'application/msword;charset=utf-8' 
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showToast('Datos exportados a DOCX ✅', 'success');
    } catch (error) {
        console.error('Error al exportar a DOCX:', error);
        showToast('Error al exportar a DOCX: ' + error.message, 'error');
    }
}

// ============================================================
// 7. FORMATO JSON (Respaldo completo)
// ============================================================
function exportToJSON(data, filename = 'alumnos_backup.json') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        const exportData = {
            metadata: {
                school: SCHOOL_CONFIG.name,
                academicYear: SCHOOL_CONFIG.academicYear,
                grade: `${SCHOOL_CONFIG.grade}° Grado "${SCHOOL_CONFIG.section}"`,
                exportedAt: new Date().toISOString(),
                totalStudents: data.length
            },
            students: data
        };

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showToast('Datos exportados a JSON ✅', 'success');
    } catch (error) {
        console.error('Error al exportar a JSON:', error);
        showToast('Error al exportar a JSON: ' + error.message, 'error');
    }
}

// ============================================================
// 8. FORMATO HTML (Vista previa)
// ============================================================
function exportToHTML(data, filename = 'alumnos.html') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        let html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de Alumnos - ${SCHOOL_CONFIG.name}</title>
            <style>
                * { box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    margin: 40px; 
                    background: #f8fafc;
                    color: #1e293b;
                }
                .container { 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    background: white; 
                    padding: 40px; 
                    border-radius: 12px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                }
                .header { 
                    border-bottom: 3px solid #2563eb; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px;
                }
                .header h1 { 
                    color: #0f3b5e; 
                    margin-bottom: 4px;
                    font-size: 24px;
                }
                .header .subtitle { 
                    color: #64748b; 
                    font-size: 14px;
                }
                .header .info {
                    display: flex;
                    gap: 30px;
                    flex-wrap: wrap;
                    margin-top: 12px;
                    font-size: 13px;
                    color: #475569;
                }
                .header .info span { 
                    background: #f1f5f9; 
                    padding: 4px 12px; 
                    border-radius: 20px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                    font-size: 14px;
                }
                th { 
                    background: #2563eb; 
                    color: white; 
                    padding: 12px; 
                    text-align: left; 
                    font-weight: 600;
                }
                td { 
                    padding: 10px; 
                    border: 1px solid #e2e8f0;
                }
                tr:nth-child(even) { 
                    background: #f8fafc; 
                }
                .footer { 
                    margin-top: 30px; 
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    color: #64748b; 
                    font-size: 13px;
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                }
                .badge {
                    display: inline-block;
                    padding: 2px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .badge-indigena { background: #fef3c7; color: #92400e; }
                .badge-sexo { background: #dbeafe; color: #1e40af; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${escHtml(SCHOOL_CONFIG.name)}</h1>
                    <div class="subtitle">Año Escolar ${SCHOOL_CONFIG.academicYear} · ${SCHOOL_CONFIG.grade}° Grado "${SCHOOL_CONFIG.section}"</div>
                    <div class="info">
                        <span>📅 ${getCurrentDate()}</span>
                        <span>🕒 Turno: ${SCHOOL_CONFIG.shift}</span>
                        <span>📞 ${SCHOOL_CONFIG.phone}</span>
                        <span>✉️ ${SCHOOL_CONFIG.email}</span>
                    </div>
                </div>
                
                <h2 style="font-size:18px; color:#0f3b5e; margin-bottom:16px;">📋 Lista de Alumnos</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Cédula Escolar</th>
                            <th>F.N.</th>
                            <th>Edad</th>
                            <th>Sexo</th>
                            <th>Indígena</th>
                            <th>Representante</th>
                            <th>Cédula Rep.</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach((s, i) => {
            const sexoBadge = s.sexo ? `<span class="badge badge-sexo">${s.sexo}</span>` : '—';
            const indBadge = s.indigena ? `<span class="badge badge-indigena">${s.indigena}</span>` : '—';
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${escHtml(s.nombre || '')}</strong></td>
                    <td>${escHtml(s.cedula_escolar || '')}</td>
                    <td>${s.fecha_nac || ''}</td>
                    <td>${s.edad || ''}</td>
                    <td>${sexoBadge}</td>
                    <td>${indBadge}</td>
                    <td>${escHtml(s.representante || '')}</td>
                    <td>${escHtml(s.cedula_rep || '')}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
                <div class="footer">
                    <span>Total de alumnos: <strong>${data.length}</strong></span>
                    <span>${SCHOOL_CONFIG.name} · ${SCHOOL_CONFIG.address}</span>
                </div>
            </div>
        </body>
        </html>
        `;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showToast('Datos exportados a HTML ✅', 'success');
    } catch (error) {
        console.error('Error al exportar a HTML:', error);
        showToast('Error al exportar a HTML: ' + error.message, 'error');
    }
}

// ============================================================
// 9. FORMATO TXT (Texto plano con formato)
// ============================================================
function exportToTXT(data, filename = 'alumnos.txt') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        let txt = '';
        txt += '='.repeat(70) + '\n';
        txt += `  ${SCHOOL_CONFIG.name}\n`;
        txt += `  Año Escolar ${SCHOOL_CONFIG.academicYear} · ${SCHOOL_CONFIG.grade}° Grado "${SCHOOL_CONFIG.section}"\n`;
        txt += `  Turno: ${SCHOOL_CONFIG.shift} · Tel: ${SCHOOL_CONFIG.phone}\n`;
        txt += `  Generado: ${getCurrentDate()}\n`;
        txt += '='.repeat(70) + '\n\n';
        txt += ' LISTA DE ALUMNOS\n';
        txt += '-'.repeat(70) + '\n\n';

        data.forEach((s, i) => {
            txt += `${String(i + 1).padStart(3)}. ${(s.nombre || '').padEnd(35)} `;
            txt += `Céd: ${(s.cedula_escolar || '').padEnd(10)} `;
            txt += `Sexo: ${(s.sexo || '-').padEnd(3)} `;
            txt += `Ind: ${(s.indigena || '-').padEnd(10)} `;
            txt += `Rep: ${(s.representante || '').padEnd(20)}\n`;
        });

        txt += '\n' + '-'.repeat(70) + '\n';
        txt += `Total de alumnos: ${data.length}\n`;
        txt += '='.repeat(70) + '\n';

        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showToast('Datos exportados a TXT ✅', 'success');
    } catch (error) {
        console.error('Error al exportar a TXT:', error);
        showToast('Error al exportar a TXT: ' + error.message, 'error');
    }
}

// ============================================================
// 10. FORMATO MARKDOWN (para documentación)
// ============================================================
function exportToMD(data, filename = 'alumnos.md') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        let md = '';
        md += `# ${SCHOOL_CONFIG.name}\n\n`;
        md += `**Año Escolar:** ${SCHOOL_CONFIG.academicYear} · ${SCHOOL_CONFIG.grade}° Grado "${SCHOOL_CONFIG.section}"\n\n`;
        md += `**Turno:** ${SCHOOL_CONFIG.shift}  \n`;
        md += `**Teléfono:** ${SCHOOL_CONFIG.phone}  \n`;
        md += `**Email:** ${SCHOOL_CONFIG.email}  \n`;
        md += `**Generado:** ${getCurrentDate()}  \n\n`;
        md += `---\n\n`;
        md += `## 📋 Lista de Alumnos\n\n`;
        md += `| # | Nombre | Cédula Escolar | F.N. | Edad | Sexo | Indígena | Representante | Cédula Rep. |\n`;
        md += `|---|--------|----------------|------|------|------|----------|---------------|-------------|\n`;

        data.forEach((s, i) => {
            md += `| ${i + 1} | ${s.nombre || ''} | ${s.cedula_escolar || ''} | ${s.fecha_nac || ''} | ${s.edad || ''} | ${s.sexo || '-'} | ${s.indigena || '-'} | ${s.representante || ''} | ${s.cedula_rep || ''} |\n`;
        });

        md += `\n**Total de alumnos:** ${data.length}\n`;
        md += `\n---\n`;
        md += `*${SCHOOL_CONFIG.name} · ${SCHOOL_CONFIG.address}*\n`;

        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showToast('Datos exportados a Markdown ✅', 'success');
    } catch (error) {
        console.error('Error al exportar a Markdown:', error);
        showToast('Error al exportar a Markdown: ' + error.message, 'error');
    }
}

// ============================================================
// 11. EXPORTAR FUNCIONES AL ÁMBITO GLOBAL
// ============================================================
window.exportToCSV = exportToCSV;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
window.exportToDOCX = exportToDOCX;
window.exportToJSON = exportToJSON;
window.exportToHTML = exportToHTML;
window.exportToTXT = exportToTXT;
window.exportToMD = exportToMD;

console.log('✅ Módulo de exportación cargado (8 formatos)');
