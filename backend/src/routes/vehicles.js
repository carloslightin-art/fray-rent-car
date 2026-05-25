const express = require('express')
const {
  listVehicles,
  listActiveVehicles,
  listFeaturedVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  toggleFeatured,
  toggleActive
} = require('../controllers/vehicleController')
const { authenticate, authorizeRoles } = require('../middleware/auth')

const router = express.Router()

// Rutas públicas (para web pública)
router.get('/active', listActiveVehicles)
router.get('/featured', listFeaturedVehicles)

// Rutas para admin
router.get('/', authenticate, authorizeRoles('owner', 'worker'), listVehicles)
router.get('/:id', authenticate, authorizeRoles('owner', 'worker'), getVehicleById)

// Rutas protegidas (solo owner)
router.post('/', authenticate, authorizeRoles('owner'), createVehicle)
router.put('/:id', authenticate, authorizeRoles('owner'), updateVehicle)
router.delete('/:id', authenticate, authorizeRoles('owner'), deleteVehicle)
router.patch('/:id/featured', authenticate, authorizeRoles('owner'), toggleFeatured)
router.patch('/:id/active', authenticate, authorizeRoles('owner'), toggleActive)

module.exports = router
