const express = require('express')
const router = express.Router()
const {
  getDashboardMetrics,
  getReservationsReport,
  getClientsReport,
  getVehiclesReport,
  getReservationsReportPDF,
  getClientsReportPDF,
  getVehiclesReportPDF
} = require('../controllers/dashboardController')

// Middleware
const { authenticate } = require('../middleware/auth')

// Rutas - requieren autenticación
router.use(authenticate)

// Métricas del dashboard
router.get('/metrics', getDashboardMetrics)

// Reportes JSON
router.get('/reports/reservations', getReservationsReport)
router.get('/reports/clients', getClientsReport)
router.get('/reports/vehicles', getVehiclesReport)

// Reportes PDF
router.get('/reports/reservations/pdf', getReservationsReportPDF)
router.get('/reports/clients/pdf', getClientsReportPDF)
router.get('/reports/vehicles/pdf', getVehiclesReportPDF)

module.exports = router

