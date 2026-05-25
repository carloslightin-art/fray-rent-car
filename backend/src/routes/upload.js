const express = require('express')
const router = express.Router()
const { uploadVehicleImageController, deleteVehicleImageController } = require('../controllers/uploadController')

// Middleware de autenticación
const { authenticate, authorizeRoles } = require('../middleware/auth')

// Ruta para subir imagen de vehículo (solo owner)
// POST /api/upload/vehicle
router.post('/vehicle', authenticate, authorizeRoles('owner'), uploadVehicleImageController)

// Ruta para eliminar imagen de vehículo (solo owner)
// DELETE /api/upload/vehicle/:vehicleId
router.delete('/vehicle/:vehicleId', authenticate, authorizeRoles('owner'), deleteVehicleImageController)

module.exports = router
