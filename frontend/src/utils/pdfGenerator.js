import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera y descarga un reporte PDF con diseño ejecutivo en tabla.
 * @param {string} tipoReporte - "Ventas", "Inventario" o "Proveedores"
 * @param {Array<Object>} datos - Lista de registros traída de la API
 */
export const descargarPDFReporte = (tipoReporte, datos) => {
  const doc = new jsPDF();
  
  // 1. Obtener la fecha actual formateada (ej: 20-10-2026)
  const hoy = new Date();
  const fechaStr = `${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${hoy.getFullYear()}`;
  const nombreArchivo = `${tipoReporte}-${fechaStr}.pdf`;

  // 2. Encabezado corporativo del Documento
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`NUMERIA - Reporte de ${tipoReporte}`, 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`Sistema de Gestión Comercial | Fecha de emisión: ${fechaStr}`, 14, 25);

  // 3. Procesamiento y construcción de la tabla estructurada
  if (Array.isArray(datos) && datos.length > 0) {
    // Excluimos columnas técnicas que no deben verse en el reporte impreso
    const columnasExcluidas = ['id', 'activo', 'proveedor_id', 'created_at', 'updated_at'];
    
    const rawKeys = Object.keys(datos[0]).filter(
      key => !columnasExcluidas.includes(key.toLowerCase())
    );

    const columnas = rawKeys.map(key => key.replace(/_/g, ' ').toUpperCase());

    const filas = datos.map(item => 
      rawKeys.map(key => {
        const val = item[key];
        if (val === null || val === undefined) return 'N/A';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      })
    );

    // Invocación directa mediante la función importada autoTable
    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      theme: 'grid',
      headStyles: {
        fillColor: [6, 182, 212], // Cyan 500
        textColor: [15, 23, 42],  // Texto oscuro corporativo
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8.5,
        cellPadding: 4,
        textColor: [51, 65, 85]   // Slate 700 para legibilidad
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Slate 50 muy suave
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No hay registros disponibles para emitir este reporte actualmente.', 14, 45);
  }

  // 4. Pie de página profesional
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Reporte generado automáticamente por Asistente Numerito | Página ${i} de ${totalPaginas}`, 14, 287);
  }

  // 5. Descarga directa del archivo PDF limpio
  doc.save(nombreArchivo);
};
