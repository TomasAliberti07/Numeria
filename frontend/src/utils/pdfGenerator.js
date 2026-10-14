import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Genera y descarga un reporte PDF estilizado.
 * @param {string} tipoReporte - "Ventas", "Inventario" o "Proveedores"
 * @param {Array<Object>} datos - Lista de registros traída de la API
 */
export const descargarPDFReporte = (tipoReporte, datos) => {
  const doc = new jsPDF();
  
  // 1. Obtener la fecha actual formateada (ej: 14-10-2026)
  const hoy = new Date();
  const fechaStr = `${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${hoy.getFullYear()}`;
  const nombreArchivo = `${tipoReporte}-${fechaStr}.pdf`;

  // 2. Encabezado del Documento
  doc.setFillColor(15, 23, 42); // Color Slate 900
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`NUMERIA - Reporte de ${tipoReporte}`, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de emisión: ${fechaStr}`, 14, 25);

  // 3. Formatear datos para la tabla si existen registros
  if (Array.isArray(datos) && datos.length > 0) {
    const columnas = Object.keys(datos[0]).map(key => key.replace('_', ' ').toUpperCase());
    const filas = datos.map(item => Object.values(item).map(val => val ?? 'N/A'));

    // Configurar e inyectar la tabla estilizada
    doc.autoTable({
      startY: 35,
      head: [columnas],
      body: filas,
      theme: 'grid',
      headStyles: {
        fillColor: [6, 182, 212], // Cyan 500
        textColor: [15, 23, 42],  // Texto oscuro para contraste
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249] // Gris claro intercalado
      }
    });
  } else {
    doc.setTextColor(100, 116, 139);
    doc.text('No hay datos disponibles para emitir este reporte.', 14, 45);
  }

  // 4. Pie de página
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Emitido por Asistente Numerito | Página ${i} de ${totalPaginas}`, 14, 287);
  }

  // 5. Descargar archivo con nombre personalizado
  doc.save(nombreArchivo);
};