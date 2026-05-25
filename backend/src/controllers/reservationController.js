const { errorDetails } = require('../utils/safeErrors')
const { Op } = require('sequelize')
const { Reservation, Client, Vehicle } = require('../models')

// Matriz de permisos: transiciones permitidas por rol
const rolePermissions = {
  owner: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['cancelled', 'finished'],
    cancelled: [],
    finished: []
  },
  worker: {
    pending: ['confirmed'],
    confirmed: ['finished'],
    cancelled: [],
    finished: []
  }
}

// Validar si la transición es permitida
const canTransition = (role, currentStatus, newStatus) => {
  const allowed = rolePermissions[role] || rolePermissions.worker
  return allowed[currentStatus]?.includes(newStatus) || false
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

const normalizeDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

const calculateReservationDays = (startDate, endDate) => {
  const diffTime = endDate.getTime() - startDate.getTime()
  return Math.ceil(diffTime / MS_PER_DAY)
}

const listReservations = async (_req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'brand', 'model', 'price_per_day'] }
      ],
      order: [['id', 'DESC']]
    })
    return res.json(reservations)
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar reservas', ...errorDetails(error) })
  }
}

const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'brand', 'model', 'price_per_day'] }
      ]
    })

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' })
    }

    return res.json(reservation)
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener reserva', ...errorDetails(error) })
  }
}

const createReservation = async (req, res) => {
  try {
    const { client_id, vehicle_id, start_date, end_date } = req.body

    if (!client_id || !vehicle_id || !start_date || !end_date) {
      return res.status(400).json({
        message: 'client_id, vehicle_id, start_date y end_date son obligatorios'
      })
    }

    const normalizedStartDate = normalizeDate(start_date)
    const normalizedEndDate = normalizeDate(end_date)
    if (!normalizedStartDate || !normalizedEndDate) {
      return res.status(400).json({ message: 'Las fechas de la reserva no son válidas' })
    }

    const reservationDays = calculateReservationDays(normalizedStartDate, normalizedEndDate)
    if (reservationDays <= 0) {
      return res.status(400).json({
        message: 'La fecha de recogida debe ser anterior a la fecha de devolución'
      })
    }

    const client = await Client.findByPk(client_id)
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    const vehicle = await Vehicle.findByPk(vehicle_id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' })
    }

    if (!vehicle.is_active) {
      return res.status(400).json({ message: 'El vehículo seleccionado no está disponible para reservas' })
    }

    if (vehicle.status === 'maintenance') {
      return res.status(400).json({ message: 'El vehículo seleccionado está en mantenimiento' })
    }

    const overlappingReservation = await Reservation.findOne({
      where: {
        vehicle_id,
        status: {
          [Op.in]: ['pending', 'confirmed']
        },
        start_date: {
          [Op.lt]: end_date
        },
        end_date: {
          [Op.gt]: start_date
        }
      }
    })

    if (overlappingReservation) {
      return res.status(409).json({
        message: 'El vehículo ya tiene una reserva activa en el rango de fechas seleccionado'
      })
    }

    const computedTotalPrice = Number((reservationDays * Number(vehicle.price_per_day)).toFixed(2))

    const reservation = await Reservation.create({
      client_id,
      vehicle_id,
      start_date,
      end_date,
      total_price: computedTotalPrice,
      status: 'pending'
    })

    return res.status(201).json(reservation)
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear reserva', ...errorDetails(error) })
  }
}

const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['pending', 'confirmed', 'cancelled', 'finished']
    const userRole = req.user?.role || 'worker'

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' })
    }

    const reservation = await Reservation.findByPk(req.params.id)
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' })
    }

    // Validar transición según rol
    if (!canTransition(userRole, reservation.status, status)) {
      return res.status(403).json({
        message: `No tienes permiso para cambiar de "${reservation.status}" a "${status}" con rol "${userRole}"`
      })
    }

    await reservation.update({ status })
    return res.json(reservation)
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar estado', ...errorDetails(error) })
  }
}

module.exports = {
  listReservations,
  getReservationById,
  createReservation,
  updateReservationStatus
}
