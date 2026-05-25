const { errorDetails } = require('../utils/safeErrors')
const { Vehicle } = require('../models')

// Listar todos los vehículos (para admin)
const listVehicles = async (_req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ 
      order: [
        ['sort_order', 'ASC'],
        ['id', 'ASC']
      ] 
    })
    return res.json(vehicles)
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
    return res.json(vehicles)
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
    return res.json(vehicles)
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
    return res.json(vehicle)
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener vehículo', ...errorDetails(error) })
  }
}

const createVehicle = async (req, res) => {
  try {
    const { brand, model, year, price_per_day, status, category, image_url, description, is_active, is_featured, sort_order } = req.body

    if (!brand || !model || !year || !price_per_day) {
      return res.status(400).json({ message: 'brand, model, year y price_per_day son obligatorios' })
    }

    const vehicle = await Vehicle.create({
      brand,
      model,
      year,
      price_per_day,
      status: status || 'available',
      category: category || 'economico',
      image_url: image_url || null,
      description: description || null,
      is_active: is_active !== undefined ? is_active : true,
      is_featured: is_featured || false,
      sort_order: sort_order || 0
    })

    return res.status(201).json(vehicle)
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

    await vehicle.update(req.body)
    return res.json(vehicle)
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

    await vehicle.destroy()
    return res.json({ message: 'Vehículo eliminado correctamente' })
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
