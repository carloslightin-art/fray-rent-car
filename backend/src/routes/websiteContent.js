const express = require('express')
const router = express.Router()
const websiteContentController = require('../controllers/websiteContentController')
const { authenticate, authorizeRoles } = require('../middleware/auth')

// Rutas públicas (para la web pública)
router.get('/all', websiteContentController.getAllContent)
router.get('/section/:section', websiteContentController.getContentBySection)
router.get('/featured-vehicles', websiteContentController.getFeaturedVehicles)

// Rutas protegidas (solo owner puede editar)
router.put('/update', authenticate, authorizeRoles('owner'), websiteContentController.updateContent)
router.put('/section', authenticate, authorizeRoles('owner'), websiteContentController.updateSectionContent)
router.put('/featured-vehicles', authenticate, authorizeRoles('owner'), websiteContentController.updateFeaturedVehicles)

module.exports = router
