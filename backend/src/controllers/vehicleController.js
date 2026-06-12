const { errorDetails } = require('../utils/safeErrors')
const fs = require('fs')
const path = require('path')
const { Vehicle, Reservation, sequelize } = require('../models')
const { normalizeVehiclePayload, serializeVehicle, parseVehicleGallery } = require('../utils/vehicleImages')

const removeUploadedVehicleFiles = (vehicle) => {
  const images = [vehicle.image_url, ...parseVehicleGallery(vehicle.gallery_images)]
    .filter((url) => typeof url === 'string' && url.startsWith('/uploads/'))

  for (const url of new Set(images)) {
    const filePath = path.join(__dirname, '../../', url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}

// Listar todos los vehículos (para admin)
const listVehicles = async (_req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ 
      order: [
        ['sort_order', 'ASC'],
        ['id', 'ASC']
      ] 
    })
    return res.json(vehicles.map(serializeVehicle))
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar vehículos', ...errorDetails(error) })
  }
}

// Listar vehículos activos (para web pública)
const listActiveVehicles = async (_req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ 
      where: { is_active: true },
      order: [
        ['sort_order', 'ASC'],
        ['id', 'ASC']
      ]
    })
    return res.json(vehicles.map(serializeVehicle))
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar vehículos', ...errorDetails(error) })
  }
}

// Listar vehículos destacados (para Home)
const listFeaturedVehicles = async (_req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ 
      where: { 
        is_active: true,
        is_featured: true
      },
      order: [
        ['sort_order', 'ASC'],
        ['id', 'ASC']
      ],
      limit: 3
    })
    return res.json(vehicles.map(serializeVehicle))
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar vehículos destacados', ...errorDetails(error) })
  }
}

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' })
    }
    return res.json(serializeVehicle(vehicle))
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener vehículo', ...errorDetails(error) })
  }
}

const createVehicle = async (req, res) => {
  try {
    const { brand, model, year, price_per_day } = req.body

    if (!brand || !model || !year || !price_per_day) {
      return res.status(400).json({ message: 'brand, model, year y price_per_day son obligatorios' })
    }

    const payload = normalizeVehiclePayload({
      ...req.body,
      status: req.body.status || 'available',
      category: req.body.category || 'economico',
      description: req.body.description || null,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      is_featured: req.body.is_featured || false,
      sort_order: req.body.sort_order || 0,
      seats: req.body.seats || 5,
      vehicle_type: req.body.vehicle_type || req.body.category || 'Económico',
      insurance_included: req.body.insurance_included !== undefined ? req.body.insurance_included : true
    })

    if (payload.image_url && (!payload.gallery_images || payload.gallery_images.length === 0)) {
      payload.gallery_images = [payload.image_url]
    }

    const vehicle = await Vehicle.create(payload)

    return res.status(201).json(serializeVehicle(vehicle))
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear vehículo', ...errorDetails(error) })
  }
}

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' })
    }

    const payload = normalizeVehiclePayload(req.body)
    await vehicle.update(payload)
    return res.json(serializeVehicle(vehicle))
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar vehículo', ...errorDetails(error) })
  }
}

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' })
    }

    const reservationCount = await Reservation.count({ where: { vehicle_id: vehicle.id } })

    await sequelize.transaction(async (transaction) => {
      if (reservationCount > 0) {
        await Reservation.destroy({ where: { vehicle_id: vehicle.id }, transaction })
      }
      await vehicle.destroy({ transaction })
    })

    removeUploadedVehicleFiles(vehicle)

    return res.json({
      message: reservationCount > 0
        ? `Vehículo eliminado correctamente junto con ${reservationCount} reserva(s) asociada(s)`
        : 'Vehículo eliminado correctamente',
      deletedReservations: reservationCount
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar vehículo', ...errorDetails(error) })
  }
}

// Alternar destacado (quick action)
const toggleFeatured = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' })
    }

    await vehicle.update({ is_featured: !vehicle.is_featured })
    return res.json({ message: 'Estado de destacado actualizado', vehicle })
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar destacado', ...errorDetails(error) })
  }
}

// Alternar activo (quick action)
const toggleActive = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' })
    }

    await vehicle.update({ is_active: !vehicle.is_active })
    return res.json({ message: 'Estado de activo actualizado', vehicle })
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar activo', ...errorDetails(error) })
  }
}

module.exports = {
  listVehicles,
  listActiveVehicles,
  listFeaturedVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  toggleFeatured,
  toggleActive
}
