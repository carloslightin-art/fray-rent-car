const express = require('express')
const {
  listReservations,
  getReservationById,
  createReservation,
  updateReservationStatus
} = require('../controllers/reservationController')
const { authenticate, authorizeRoles } = require('../middleware/auth')

const router = express.Router()

router.get('/', authenticate, authorizeRoles('owner', 'worker'), listReservations)
router.get('/:id', authenticate, authorizeRoles('owner', 'worker'), getReservationById)
router.post('/', createReservation)
router.patch('/:id/status', authenticate, authorizeRoles('owner', 'worker'), updateReservationStatus)

module.exports = router
