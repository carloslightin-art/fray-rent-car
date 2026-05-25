const express = require('express')
const router = express.Router()
const { 
  listUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  changePassword,
  toggleActive 
} = require('../controllers/userController')

// Middleware
const { authenticate } = require('../middleware/auth')
const { authorizeRoles } = require('../middleware/auth')

// Rutas - solo owner puede gestionar usuarios
router.use(authenticate)
router.use(authorizeRoles('owner'))

// Listar usuarios
router.get('/', listUsers)

// Obtener usuario por ID
router.get('/:id', getUserById)

// Crear usuario
router.post('/', createUser)

// Actualizar usuario
router.put('/:id', updateUser)

// Eliminar usuario
router.delete('/:id', deleteUser)

// Cambiar contraseña
router.patch('/:id/password', changePassword)

// Alternar activo
router.patch('/:id/active', toggleActive)

module.exports = router
