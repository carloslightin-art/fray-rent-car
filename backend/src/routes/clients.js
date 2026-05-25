const express = require('express')
const {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController')
const { authenticate, authorizeRoles } = require('../middleware/auth')

const router = express.Router()

router.get('/', authenticate, authorizeRoles('owner', 'worker'), listClients)
router.get('/:id', authenticate, authorizeRoles('owner', 'worker'), getClientById)
router.post('/', createClient)
router.put('/:id', authenticate, authorizeRoles('owner', 'worker'), updateClient)
router.delete('/:id', authenticate, authorizeRoles('owner'), deleteClient)

module.exports = router
