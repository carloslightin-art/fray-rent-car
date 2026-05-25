const PDFDocument = require('pdfkit')

// Colores de FRAY RENT CAR
const COLORS = {
  gold: '#c9a227',
  dark: '#050505',
  light: '#e5c158'
}

/**
 * Genera un PDF de reporte de reservas
 * @param {Array} reservations - Datos de reservas
 * @param {Object} res - Response para enviar el PDF
 */
const generateReservationsPDF = (reservations, res) => {
  const doc = new PDFDocument({ margin: 40 })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename="reporte_reservas.pdf"')

  doc.pipe(res)

  // Encabezado
  doc.fontSize(24).font('Helvetica-Bold').fillColor(COLORS.dark).text('FRAY RENT CAR', { align: 'center' })
  doc.fontSize(12).font('Helvetica').fillColor(COLORS.gold).text('Reporte de Reservas', { align: 'center' })
  doc.fontSize(10).fillColor('#666').text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, { align: 'center' })

  doc.moveDown(1)
  doc.strokeColor(COLORS.gold).lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(1)

  // Tabla de datos
  if (!reservations || reservations.length === 0) {
    doc.fontSize(11).fillColor(COLORS.dark).text('No hay registros disponibles', { align: 'center' })
  } else {
    const headers = ['ID', 'Cliente', 'Vehículo', 'Inicio', 'Fin', 'Estado', 'Importe']
    const colWidths = [40, 120, 100, 70, 70, 70, 85]
    let yPos = doc.y

    // Header de tabla
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.dark)
    headers.forEach((header, i) => {
      doc.text(header, 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos, { width: colWidths[i], align: 'left' })
    })

    yPos += 20
    doc.strokeColor(COLORS.gold).lineWidth(0.5).moveTo(40, yPos).lineTo(555, yPos).stroke()
    yPos += 10

    // Data rows
    doc.font('Helvetica').fontSize(9).fillColor('#333')
    reservations.forEach((row, idx) => {
      if (yPos > 750) {
        doc.addPage()
        yPos = 40
      }

      const rowData = [
        row.id || '',
        row.cliente || 'N/A',
        row.vehiculo || 'N/A',
        row.fecha_inicio || '',
        row.fecha_fin || '',
        row.estado || '',
        `€${parseFloat(row.importe || 0).toFixed(2)}`
      ]

      rowData.forEach((data, i) => {
        doc.text(data, 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos, { width: colWidths[i], align: 'left' })
      })

      yPos += 18
    })
  }

  // Pie de página
  doc.moveDown(2)
  doc.strokeColor(COLORS.gold).lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.5)
  doc.fontSize(8).fillColor('#999').text(`Reporte de Reservas | FRAY RENT CAR | ${reservations?.length || 0} registros`, { align: 'center' })

  doc.end()
}

/**
 * Genera un PDF de reporte de clientes
 * @param {Array} clients - Datos de clientes
 * @param {Object} res - Response para enviar el PDF
 */
const generateClientsPDF = (clients, res) => {
  const doc = new PDFDocument({ margin: 40 })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename="reporte_clientes.pdf"')

  doc.pipe(res)

  // Encabezado
  doc.fontSize(24).font('Helvetica-Bold').fillColor(COLORS.dark).text('FRAY RENT CAR', { align: 'center' })
  doc.fontSize(12).font('Helvetica').fillColor(COLORS.gold).text('Reporte de Clientes', { align: 'center' })
  doc.fontSize(10).fillColor('#666').text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, { align: 'center' })

  doc.moveDown(1)
  doc.strokeColor(COLORS.gold).lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(1)

  // Tabla de datos
  if (!clients || clients.length === 0) {
    doc.fontSize(11).fillColor(COLORS.dark).text('No hay registros disponibles', { align: 'center' })
  } else {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Fecha Alta', 'Reservas', 'Gastado']
    const colWidths = [35, 100, 130, 90, 80, 50, 70]
    let yPos = doc.y

    // Header de tabla
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.dark)
    headers.forEach((header, i) => {
      doc.text(header, 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos, { width: colWidths[i], align: 'left' })
    })

    yPos += 20
    doc.strokeColor(COLORS.gold).lineWidth(0.5).moveTo(40, yPos).lineTo(555, yPos).stroke()
    yPos += 10

    // Data rows
    doc.font('Helvetica').fontSize(9).fillColor('#333')
    clients.forEach((row) => {
      if (yPos > 750) {
        doc.addPage()
        yPos = 40
      }

      const rowData = [
        row.id || '',
        row.nombre || 'N/A',
        row.email || 'N/A',
        row.telefono || 'N/A',
        row.fecha_alta || '',
        row.total_reservas || 0,
        `€${parseFloat(row.total_gastado || 0).toFixed(2)}`
      ]

      rowData.forEach((data, i) => {
        doc.text(data, 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos, { width: colWidths[i], align: 'left' })
      })

      yPos += 18
    })
  }

  // Pie de página
  doc.moveDown(2)
  doc.strokeColor(COLORS.gold).lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.5)
  doc.fontSize(8).fillColor('#999').text(`Reporte de Clientes | FRAY RENT CAR | ${clients?.length || 0} registros`, { align: 'center' })

  doc.end()
}

/**
 * Genera un PDF de reporte de vehículos
 * @param {Array} vehicles - Datos de vehículos
 * @param {Object} res - Response para enviar el PDF
 */
const generateVehiclesPDF = (vehicles, res) => {
  const doc = new PDFDocument({ margin: 40 })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename="reporte_vehiculos.pdf"')

  doc.pipe(res)

  // Encabezado
  doc.fontSize(24).font('Helvetica-Bold').fillColor(COLORS.dark).text('FRAY RENT CAR', { align: 'center' })
  doc.fontSize(12).font('Helvetica').fillColor(COLORS.gold).text('Reporte de Vehículos', { align: 'center' })
  doc.fontSize(10).fillColor('#666').text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, { align: 'center' })

  doc.moveDown(1)
  doc.strokeColor(COLORS.gold).lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(1)

  // Tabla de datos
  if (!vehicles || vehicles.length === 0) {
    doc.fontSize(11).fillColor(COLORS.dark).text('No hay registros disponibles', { align: 'center' })
  } else {
    const headers = ['ID', 'Marca', 'Modelo', 'Año', 'Categoría', 'Precio/Día', 'Estado', 'Activo', 'Destacado']
    const colWidths = [30, 70, 70, 40, 60, 60, 65, 45, 55]
    let yPos = doc.y

    // Header de tabla
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.dark)
    headers.forEach((header, i) => {
      doc.text(header, 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos, { width: colWidths[i], align: 'left', ellipsis: true })
    })

    yPos += 20
    doc.strokeColor(COLORS.gold).lineWidth(0.5).moveTo(40, yPos).lineTo(555, yPos).stroke()
    yPos += 10

    // Data rows
    doc.font('Helvetica').fontSize(8).fillColor('#333')
    vehicles.forEach((row) => {
      if (yPos > 750) {
        doc.addPage()
        yPos = 40
      }

      const rowData = [
        row.id || '',
        row.marca || 'N/A',
        row.modelo || 'N/A',
        row.año || '',
        row.categoria || 'N/A',
        `€${parseFloat(row.precio_dia || 0).toFixed(2)}`,
        row.estado || '',
        row.activo || 'No',
        row.destacado || 'No'
      ]

      rowData.forEach((data, i) => {
        doc.text(data, 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos, { width: colWidths[i], align: 'left', ellipsis: true })
      })

      yPos += 16
    })
  }

  // Pie de página
  doc.moveDown(2)
  doc.strokeColor(COLORS.gold).lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.5)
  doc.fontSize(8).fillColor('#999').text(`Reporte de Vehículos | FRAY RENT CAR | ${vehicles?.length || 0} registros`, { align: 'center' })

  doc.end()
}

module.exports = {
  generateReservationsPDF,
  generateClientsPDF,
  generateVehiclesPDF
}
