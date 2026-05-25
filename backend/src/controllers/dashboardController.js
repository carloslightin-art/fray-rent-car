const { errorDetails } = require('../utils/safeErrors')
const { Vehicle, Client, Reservation, User } = require('../models')
const sequelize = require('../config/database')
const Sequelize = require('sequelize')
const { Op } = Sequelize
const { generateReservationsPDF, generateClientsPDF, generateVehiclesPDF } = require('../services/pdfService')

// Obtener métricas del dashboard
const getDashboardMetrics = async (req, res) => {
  try {
    // Total de vehículos
    const totalVehicles = await Vehicle.count()
    const activeVehicles = await Vehicle.count({ where: { is_active: true } })
    const featuredVehicles = await Vehicle.count({ where: { is_featured: true } })

    // Total de clientes
    const totalClients = await Client.count()

    // Total de usuarios
    const totalUsers = await User.count()
    const activeUsers = await User.count({ where: { is_active: true } })

    // Reservas - corregir estados
    const totalReservations = await Reservation.count()
    const pendingReservations = await Reservation.count({ where: { status: 'pending' } })
    const activeReservations = await Reservation.count({ where: { status: { [Op.in]: ['confirmed', 'pending'] } } })
    const completedReservations = await Reservation.count({ where: { status: 'finished' } })
    const cancelledReservations = await Reservation.count({ where: { status: 'cancelled' } })

    // Calcular ingresos (suma de total_price de reservas finalizadas)
    const [incomeResult] = await sequelize.query(`
      SELECT COALESCE(SUM(total_price), 0) as total 
      FROM reservations 
      WHERE status = 'finished'
    `)
    const totalIncome = incomeResult[0]?.total || 0

    // Últimas reservas - aliases correctos
    const recentReservations = await Reservation.findAll({
      include: [
        { model: Client, as: 'client', attributes: ['name', 'email'] },
        { model: Vehicle, as: 'vehicle', attributes: ['brand', 'model'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    })

    return res.json({
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        featured: featuredVehicles
      },
      clients: {
        total: totalClients
      },
      users: {
        total: totalUsers,
        active: activeUsers
      },
      reservations: {
        total: totalReservations,
        pending: pendingReservations,
        active: activeReservations,
        completed: completedReservations,
        cancelled: cancelledReservations
      },
      income: {
        total: parseFloat(totalIncome)
      },
      recentReservations: recentReservations.map(r => ({
        id: r.id,
        client: r.client?.name || 'N/A',
        vehicle: r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : 'N/A',
        status: r.status,
        total: r.total_price,
        date: r.created_at
      }))
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener métricas', ...errorDetails(error) })
  }
}

// Reporte de reservas - corregir aliases
const getReservationsReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query

    let whereClause = {}
    
    if (startDate && endDate) {
      whereClause = {
        ...whereClause,
        created_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      }
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    const reservations = await Reservation.findAll({
      where: whereClause,
      include: [
        { model: Client, as: 'client', attributes: ['name', 'email', 'phone'] },
        { model: Vehicle, as: 'vehicle', attributes: ['brand', 'model', 'category'] }
      ],
      order: [['created_at', 'DESC']]
    })

    const data = reservations.map(r => ({
      id: r.id,
      fecha: r.created_at ? new Date(r.created_at).toLocaleDateString('es-ES') : '',
      cliente: r.client?.name || 'N/A',
      email: r.client?.email || 'N/A',
      telefono: r.client?.phone || 'N/A',
      vehiculo: r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : 'N/A',
      categoria: r.vehicle?.category || 'N/A',
      fecha_inicio: r.start_date || '',
      fecha_fin: r.end_date || '',
      estado: r.status,
      importe: r.total_price || 0
    }))

    return res.json(data)
  } catch (error) {
    return res.status(500).json({ message: 'Error al generar reporte', ...errorDetails(error) })
  }
}

// Reporte de clientes
const getClientsReport = async (req, res) => {
  try {
    const clients = await Client.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'created_at']
    })

    // Obtener total de reservas por cliente
    const [reservationsCount] = await sequelize.query(`
      SELECT client_id, COUNT(*) as total, COALESCE(SUM(total_price), 0) as total_spent
      FROM reservations
      GROUP BY client_id
    `)

    const countMap = {}
    reservationsCount.forEach(r => {
      countMap[r.client_id] = { count: r.total, spent: r.total_spent }
    })

    const data = clients.map(c => ({
      id: c.id,
      nombre: c.name,
      email: c.email,
      telefono: c.phone || 'N/A',
      fecha_alta: c.created_at ? new Date(c.created_at).toLocaleDateString('es-ES') : '',
      total_reservas: countMap[c.id]?.count || 0,
      total_gastado: parseFloat(countMap[c.id]?.spent || 0)
    }))

    return res.json(data)
  } catch (error) {
    return res.status(500).json({ message: 'Error al generar reporte', ...errorDetails(error) })
  }
}

// Reporte de vehículos
const getVehiclesReport = async (req, res) => {
  try {
    const { category, isActive } = req.query

    let whereClause = {}

    if (category && category !== 'all') {
      whereClause.category = category
    }

    if (isActive !== undefined && isActive !== '') {
      whereClause.is_active = isActive === 'true'
    }

    const vehicles = await Vehicle.findAll({
      where: whereClause,
      order: [['sort_order', 'ASC'], ['id', 'ASC']]
    })

    const data = vehicles.map(v => ({
      id: v.id,
      marca: v.brand,
      modelo: v.model,
      año: v.year,
      categoria: v.category || 'estandar',
      precio_dia: v.price_per_day,
      estado: v.status,
      activo: v.is_active ? 'Sí' : 'No',
      destacado: v.is_featured ? 'Sí' : 'No',
      orden: v.sort_order || 0
    }))

    return res.json(data)
  } catch (error) {
    return res.status(500).json({ message: 'Error al generar reporte', ...errorDetails(error) })
  }
}

// PDF - Reporte de reservas
const getReservationsReportPDF = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query

    let whereClause = {}

    if (startDate && endDate) {
      whereClause = {
        ...whereClause,
        created_at: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      }
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    const reservations = await Reservation.findAll({
      where: whereClause,
      include: [
        { model: Client, as: 'client', attributes: ['name', 'email', 'phone'] },
        { model: Vehicle, as: 'vehicle', attributes: ['brand', 'model', 'category'] }
      ],
      order: [['created_at', 'DESC']]
    })

    const data = reservations.map(r => ({
      id: r.id,
      fecha: r.created_at ? new Date(r.created_at).toLocaleDateString('es-ES') : '',
      cliente: r.client?.name || 'N/A',
      email: r.client?.email || 'N/A',
      telefono: r.client?.phone || 'N/A',
      vehiculo: r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : 'N/A',
      categoria: r.vehicle?.category || 'N/A',
      fecha_inicio: r.start_date || '',
      fecha_fin: r.end_date || '',
      estado: r.status,
      importe: r.total_price || 0
    }))

    generateReservationsPDF(data, res)
  } catch (error) {
    return res.status(500).json({ message: 'Error al generar PDF', ...errorDetails(error) })
  }
}

// PDF - Reporte de clientes
const getClientsReportPDF = async (req, res) => {
  try {
    const clients = await Client.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'created_at']
    })

    const [reservationsCount] = await sequelize.query(`
      SELECT client_id, COUNT(*) as total, COALESCE(SUM(total_price), 0) as total_spent
      FROM reservations
      GROUP BY client_id
    `)

    const countMap = {}
    reservationsCount.forEach(r => {
      countMap[r.client_id] = { count: r.total, spent: r.total_spent }
    })

    const data = clients.map(c => ({
      id: c.id,
      nombre: c.name,
      email: c.email,
      telefono: c.phone || 'N/A',
      fecha_alta: c.created_at ? new Date(c.created_at).toLocaleDateString('es-ES') : '',
      total_reservas: countMap[c.id]?.count || 0,
      total_gastado: parseFloat(countMap[c.id]?.spent || 0)
    }))

    generateClientsPDF(data, res)
  } catch (error) {
    return res.status(500).json({ message: 'Error al generar PDF', ...errorDetails(error) })
  }
}

// PDF - Reporte de vehículos
const getVehiclesReportPDF = async (req, res) => {
  try {
    const { category, isActive } = req.query

    let whereClause = {}

    if (category && category !== 'all') {
      whereClause.category = category
    }

    if (isActive !== undefined && isActive !== '') {
      whereClause.is_active = isActive === 'true'
    }

    const vehicles = await Vehicle.findAll({
      where: whereClause,
      order: [['sort_order', 'ASC'], ['id', 'ASC']]
    })

    const data = vehicles.map(v => ({
      id: v.id,
      marca: v.brand,
      modelo: v.model,
      año: v.year,
      categoria: v.category || 'estandar',
      precio_dia: v.price_per_day,
      estado: v.status,
      activo: v.is_active ? 'Sí' : 'No',
      destacado: v.is_featured ? 'Sí' : 'No',
      orden: v.sort_order || 0
    }))

    generateVehiclesPDF(data, res)
  } catch (error) {
    return res.status(500).json({ message: 'Error al generar PDF', ...errorDetails(error) })
  }
}

module.exports = {
  getDashboardMetrics,
  getReservationsReport,
  getClientsReport,
  getVehiclesReport,
  getReservationsReportPDF,
  getClientsReportPDF,
  getVehiclesReportPDF
}
