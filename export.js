// export.js - Módulo de exportación de datos

// Función principal para exportar a CSV
function exportToCSV(data, filename = 'alumnos.csv') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    // Definir encabezados
    const headers = ['Nombre', 'Cédula Escolar', 'Fecha Nac.', 'Edad', 'Sexo', 'Indígena', 'Representante', 'Cédula Rep.'];
    
    // Mapear datos a filas
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

    // Construir CSV
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        // Escapar comillas y comas
        const escaped = row.map(cell => {
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        });
        csv += escaped.join(',') + '\n';
    });

    // Descargar
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

// Función para exportar a Excel (usando SheetJS)
async function exportToExcel(data, filename = 'alumnos.xlsx') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        // Cargar la librería SheetJS desde CDN (si no está cargada)
        if (typeof XLSX === 'undefined') {
            await loadScript('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js');
        }

        // Preparar datos para hoja de cálculo
        const worksheetData = [
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

// Función para exportar a PDF (usando jsPDF)
async function exportToPDF(data, filename = 'alumnos.pdf') {
    if (!data || !data.length) {
        alert('No hay datos para exportar.');
        return;
    }

    try {
        // Cargar librerías jsPDF y autoTable
        if (typeof window.jspdf === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.plugins === 'undefined' || !window.jspdf.plugins.autoTable) {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.0/jspdf.plugin.autotable.min.js');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'a4');

        // Título
        doc.setFontSize(16);
        doc.text('Lista de Alumnos - Matrícula 2025-2026', 14, 20);

        // Fecha
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 28);

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
            startY: 34,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 20 },
                2: { cellWidth: 20 },
                3: { cellWidth: 15 },
                4: { cellWidth: 15 },
                5: { cellWidth: 25 },
                6: { cellWidth: 40 },
                7: { cellWidth: 25 }
            }
        });

        doc.save(filename);
        showToast('Datos exportados a PDF ✅', 'success');
    } catch (error) {
        console.error('Error al exportar a PDF:', error);
        showToast('Error al exportar a PDF: ' + error.message, 'error');
    }
}

// Función auxiliar para cargar scripts dinámicamente
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Exportar funciones al ámbito global (para que app.js las pueda usar)
window.exportToCSV = exportToCSV;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;