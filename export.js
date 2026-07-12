// ============================================================
// export.js - Módulo de exportación avanzado (8 formatos)
// ============================================================

// ============================================================
// 1. CONFIGURACIÓN INSTITUCIONAL (vacía para que el usuario complete)
// ============================================================
const SCHOOL_CONFIG = {
    name: '',  // ← COMPLETAR CON NOMBRE DE LA ESCUELA
    code: '',
    address: '',
    phone: '',
    email: '',
    academicYear: '2025-2026',
    grade: '',
    section: '',
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

function getCurrentDate() {
    return new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ============================================================
// 3. FORMATO CSV
// ============================================================
function exportToCSV(data, filename = 'alumnos.csv') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    const headers = ['Nombre', 'Cédula Escolar', 'Fecha Nac.', 'Edad', 'Sexo', 'Indígena', 'Grado', 'Sección', 'Representante', 'Cédula Rep.'];
    const rows = data.map(s => [
        s.nombre || '',
        s.cedula_escolar || '',
        s.fecha_nac || '',
        s.edad || '',
        s.sexo || '',
        s.indigena || '',
        s.grado || '',
        s.seccion || '',
        s.representante || '',
        s.cedula_rep || ''
    ]);

    let csv = '';
    csv += `# ${SCHOOL_CONFIG.name || 'Institución Educativa'}\n`;
    csv += `# Año Escolar ${SCHOOL_CONFIG.academicYear || '2025-2026'}\n`;
    csv += `# Generado: ${getCurrentDate()}\n`;
    csv += '# ' + '-'.repeat(50) + '\n';
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
            [SCHOOL_CONFIG.name || 'Institución Educativa'],
            [`Año Escolar ${SCHOOL_CONFIG.academicYear || '2025-2026'}`],
            [`Generado: ${getCurrentDate()}`],
            [],
            ['Nombre', 'Cédula Escolar', 'Fecha Nac.', 'Edad', 'Sexo', 'Indígena', 'Grado', 'Sección', 'Representante', 'Cédula Rep.']
        ];
        data.forEach(s => {
            worksheetData.push([
                s.nombre || '',
                s.cedula_escolar || '',
                s.fecha_nac || '',
                s.edad || '',
                s.sexo || '',
                s.indigena || '',
                s.grado || '',
                s.seccion || '',
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

        doc.setFontSize(16);
        doc.text(SCHOOL_CONFIG.name || 'Institución Educativa', 14, 18);
        doc.setFontSize(12);
        doc.text(`Año Escolar ${SCHOOL_CONFIG.academicYear || '2025-2026'}`, 14, 26);
        doc.setFontSize(10);
        doc.text(`Generado: ${getCurrentDate()}`, 14, 32);

        const tableHeaders = [['Nombre', 'Cédula', 'F.N.', 'Edad', 'Sexo', 'Indígena', 'Grado', 'Sección', 'Representante', 'Cédula Rep.']];
        const tableRows = data.map(s => [
            s.nombre || '',
            s.cedula_escolar || '',
            s.fecha_nac || '',
            s.edad || '',
            s.sexo || '',
            s.indigena || '',
            s.grado || '',
            s.seccion || '',
            s.representante || '',
            s.cedula_rep || ''
        ]);

        doc.autoTable({
            head: tableHeaders,
            body: tableRows,
            startY: 38,
            styles: { fontSize: 7, cellPadding: 2 },
            headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 18 },
                2: { cellWidth: 16 },
                3: { cellWidth: 12 },
                4: { cellWidth: 12 },
                5: { cellWidth: 18 },
                6: { cellWidth: 16 },
                7: { cellWidth: 14 },
                8: { cellWidth: 30 },
                9: { cellWidth: 18 }
            }
        });

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
// 6. FORMATO DOCX (Word) - Versión mejorada con HTML
// ============================================================
// ============================================================
// 6. FORMATO DOCX (Word) - Versión estable con librería docx.js
// ============================================================
async function exportToDOCX(data, filename = 'alumnos.docx') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        // Cargar la librería docx.js desde CDN (versión estable)
        if (typeof window.docx === 'undefined') {
            await loadScript('https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.min.js');
        }

        const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, HeadingLevel, AlignmentType, convertInchesToTwip } = window.docx;

        // Construir documento
        const children = [];

        // Título
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ 
                        text: SCHOOL_CONFIG.name || 'Institución Educativa', 
                        bold: true, 
                        size: 32,
                        font: 'Arial'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            })
        );

        // Subtítulo
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Año Escolar ${SCHOOL_CONFIG.academicYear || '2025-2026'}`,
                        size: 22,
                        font: 'Arial',
                        color: '333333'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            })
        );

        // Fecha
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Generado: ${getCurrentDate()}`,
                        size: 18,
                        font: 'Arial',
                        color: '666666'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );

        // Tabla de alumnos
        const tableRows = [];

        // Encabezados
        const headerCells = [
            'N°', 'Nombre', 'Cédula', 'F.N.', 'Edad', 'Sexo', 'Indígena', 'Grado', 'Sección', 'Representante', 'Cédula Rep.'
        ].map(text => new TableCell({
            children: [new Paragraph({
                children: [new TextRun({ text, bold: true, size: 18, font: 'Arial' })],
                alignment: AlignmentType.CENTER
            })],
            shading: { fill: 'dbeafe' },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 }
            }
        }));

        tableRows.push(new TableRow({ children: headerCells }));

        // Datos
        data.forEach((s, i) => {
            const rowCells = [
                String(i + 1),
                s.nombre || '',
                s.cedula_escolar || '',
                s.fecha_nac || '',
                String(s.edad || ''),
                s.sexo || '',
                s.indigena || '',
                s.grado || '',
                s.seccion || '',
                s.representante || '',
                s.cedula_rep || ''
            ].map(text => new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: String(text), size: 16, font: 'Arial' })],
                    alignment: AlignmentType.CENTER
                })],
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 }
                }
            }));

            tableRows.push(new TableRow({ children: rowCells }));
        });

        // Crear tabla
        children.push(
            new Table({
                rows: tableRows,
                width: { size: 100, type: 'percentage' },
                borders: {
                    insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 }
                }
            })
        );

        // Pie de página
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Total de alumnos: ${data.length}`,
                        size: 18,
                        font: 'Arial',
                        color: '666666'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200 }
            })
        );

        // Crear documento
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: convertInchesToTwip(0.8),
                            bottom: convertInchesToTwip(0.8),
                            left: convertInchesToTwip(0.8),
                            right: convertInchesToTwip(0.8)
                        }
                    }
                },
                children: children
            }]
        });

        // Generar y descargar
        const blob = await Packer.toBlob(doc);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showToast('Datos exportados a DOCX ✅', 'success');
    } catch (error) {
        console.error('Error al exportar a DOCX con docx.js, usando fallback HTML:', error);
        // Fallback: usar método HTML (más compatible)
        try {
            await exportToDOCXFallback(data, filename);
        } catch (fallbackError) {
            showToast('Error al exportar a DOCX: ' + fallbackError.message, 'error');
        }
    }
}

// ============================================================
// 6b. FALLBACK DOCX (HTML con formato MIME para Word)
// ============================================================
async function exportToDOCXFallback(data, filename = 'alumnos.docx') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        // Usar MIME HTML (Word lo abre sin problemas)
        let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <!--[if gte mso 9]>
            <xml>
                <w:WordDocument>
                    <w:View>Print</w:View>
                    <w:Zoom>100</w:Zoom>
                    <w:DoNotOptimizeForBrowser/>
                </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
                /* Estilos para Word */
                body { 
                    font-family: 'Arial', sans-serif; 
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
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    font-size: 9pt;
                    margin-top: 20px;
                }
                th { 
                    background: #2563eb; 
                    color: white; 
                    padding: 6px 8px; 
                    text-align: left; 
                    font-weight: bold;
                    border: 1px solid #2563eb;
                }
                td { 
                    padding: 4px 6px; 
                    border: 1px solid #d1d5db;
                    text-align: center;
                }
                .footer { 
                    margin-top: 30px; 
                    padding-top: 20px;
                    border-top: 1px solid #d1d5db;
                    color: #64748b; 
                    font-size: 10pt;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${SCHOOL_CONFIG.name || 'Institución Educativa'}</h1>
                <div class="subtitle">Año Escolar ${SCHOOL_CONFIG.academicYear || '2025-2026'}</div>
                <div class="info">
                    <span>📅 ${getCurrentDate()}</span>
                </div>
            </div>
            
            <h2 style="font-size:14pt; color:#0f3b5e; margin-bottom:16px;">📋 Lista de Alumnos</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Cédula</th>
                        <th>F.N.</th>
                        <th>Edad</th>
                        <th>Sexo</th>
                        <th>Indígena</th>
                        <th>Grado</th>
                        <th>Sección</th>
                        <th>Representante</th>
                        <th>Cédula Rep.</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach((s, i) => {
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${escHtml(s.nombre || '')}</td>
                    <td>${escHtml(s.cedula_escolar || '')}</td>
                    <td>${s.fecha_nac || ''}</td>
                    <td>${s.edad || ''}</td>
                    <td>${s.sexo || ''}</td>
                    <td>${s.indigena || ''}</td>
                    <td>${s.grado || ''}</td>
                    <td>${s.seccion || ''}</td>
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
                <p>${SCHOOL_CONFIG.name || 'Institución Educativa'}</p>
            </div>
        </body>
        </html>
        `;

        // Crear archivo DOCX con formato MIME (Word lo abre)
        const blob = new Blob([html], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8'
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showToast('Datos exportados a DOCX (versión compatible) ✅', 'success');
    } catch (error) {
        console.error('Error en fallback DOCX:', error);
        throw error;
    }
}
// ============================================================
// 7. FORMATO JSON (Respaldo)
// ============================================================
function exportToJSON(data, filename = 'alumnos_backup.json') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        const exportData = {
            metadata: {
                school: SCHOOL_CONFIG.name || 'Institución Educativa',
                academicYear: SCHOOL_CONFIG.academicYear || '2025-2026',
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
            <title>Lista de Alumnos</title>
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
                    <h1>${escHtml(SCHOOL_CONFIG.name || 'Institución Educativa')}</h1>
                    <div class="subtitle">Año Escolar ${SCHOOL_CONFIG.academicYear || '2025-2026'}</div>
                    <div class="info">
                        <span>📅 ${getCurrentDate()}</span>
                        <span>📞 ${SCHOOL_CONFIG.phone || ''}</span>
                        <span>✉️ ${SCHOOL_CONFIG.email || ''}</span>
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
                            <th>Grado</th>
                            <th>Sección</th>
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
                    <td>${s.grado || ''}</td>
                    <td>${s.seccion || ''}</td>
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
                    <span>${SCHOOL_CONFIG.name || 'Institución Educativa'} · ${SCHOOL_CONFIG.address || ''}</span>
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
// 9. FORMATO TXT (Texto plano)
// ============================================================
function exportToTXT(data, filename = 'alumnos.txt') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        let txt = '';
        txt += '='.repeat(80) + '\n';
        txt += `  ${SCHOOL_CONFIG.name || 'Institución Educativa'}\n`;
        txt += `  Año Escolar ${SCHOOL_CONFIG.academicYear || '2025-2026'}\n`;
        txt += `  Generado: ${getCurrentDate()}\n`;
        txt += '='.repeat(80) + '\n\n';
        txt += ' LISTA DE ALUMNOS\n';
        txt += '-'.repeat(80) + '\n\n';

        data.forEach((s, i) => {
            txt += `${String(i + 1).padStart(3)}. ${(s.nombre || '').padEnd(35)} `;
            txt += `Céd: ${(s.cedula_escolar || '').padEnd(10)} `;
            txt += `Sexo: ${(s.sexo || '-').padEnd(3)} `;
            txt += `Grado: ${(s.grado || '').padEnd(6)} `;
            txt += `Sec: ${(s.seccion || '').padEnd(3)} `;
            txt += `Rep: ${(s.representante || '').padEnd(20)}\n`;
        });

        txt += '\n' + '-'.repeat(80) + '\n';
        txt += `Total de alumnos: ${data.length}\n`;
        txt += '='.repeat(80) + '\n';

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
// 10. FORMATO MARKDOWN
// ============================================================
function exportToMD(data, filename = 'alumnos.md') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        let md = '';
        md += `# ${SCHOOL_CONFIG.name || 'Institución Educativa'}\n\n`;
        md += `**Año Escolar:** ${SCHOOL_CONFIG.academicYear || '2025-2026'}\n\n`;
        md += `**Generado:** ${getCurrentDate()}\n\n`;
        md += `---\n\n`;
        md += `## 📋 Lista de Alumnos\n\n`;
        md += `| # | Nombre | Cédula | F.N. | Edad | Sexo | Indígena | Grado | Sección | Representante | Cédula Rep. |\n`;
        md += `|---|--------|--------|------|------|------|----------|-------|---------|---------------|-------------|\n`;

        data.forEach((s, i) => {
            md += `| ${i + 1} | ${s.nombre || ''} | ${s.cedula_escolar || ''} | ${s.fecha_nac || ''} | ${s.edad || ''} | ${s.sexo || '-'} | ${s.indigena || '-'} | ${s.grado || ''} | ${s.seccion || ''} | ${s.representante || ''} | ${s.cedula_rep || ''} |\n`;
        });

        md += `\n**Total de alumnos:** ${data.length}\n`;
        md += `\n---\n`;
        md += `*${SCHOOL_CONFIG.name || 'Institución Educativa'} · ${SCHOOL_CONFIG.address || ''}*\n`;

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
