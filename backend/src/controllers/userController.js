const { errorDetails } = require('../utils/safeErrors')
const bcrypt = require('bcryptjs')
const { User } = require('../models')

// Listar todos los usuarios
const listUsers = async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
      order: [['id', 'ASC']]
    })
    return res.json(users)
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar usuarios', ...errorDetails(error) })
  }
}

// Obtener usuario por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at']
    })
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    return res.json(user)
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener usuario', ...errorDetails(error) })
  }
}

// Crear usuario
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Validar campos obligatorios
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email y password son obligatorios' })
    }

    // Validar email único
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está en uso' })
    }

    // Validar rol
    if (role && !['owner', 'worker'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido. Debe ser owner o worker' })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'worker',
      is_active: true
    })

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear usuario', ...errorDetails(error) })
  }
}

// Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role, is_active } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Validar email único si cambia
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está en uso' })
      }
    }

    // Validar rol
    if (role && !['owner', 'worker'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido. Debe ser owner o worker' })
    }

    // Actualizar campos
    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      is_active: is_active !== undefined ? is_active : user.is_active
    })

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar usuario', ...errorDetails(error) })
  }
}

// Eliminar usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // No permitir eliminar al último owner
    if (user.role === 'owner') {
      const ownerCount = await User.count({ where: { role: 'owner' } })
      if (ownerCount <= 1) {
        return res.status(400).json({ message: 'No se puede eliminar al último usuario owner' })
      }
    }

    await user.destroy()
    return res.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar usuario', ...errorDetails(error) })
  }
}

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 4 caracteres' })
    }

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await user.update({ password: hashedPassword })

    return res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    return res.status(500).json({ message: 'Error al cambiar contraseña', ...errorDetails(error) })
  }
}

// Alternar activo
const toggleActive = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // No permitir desactivar al último owner
    if (user.role === 'owner' && user.is_active && user.id === req.user.id) {
      return res.status(400).json({ message: 'No puedes desactivarte a ti mismo siendo owner' })
    }

    await user.update({ is_active: !user.is_active })

    return res.json({
      message: user.is_active ? 'Usuario activado' : 'Usuario desactivado',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error al cambiar estado', ...errorDetails(error) })
  }
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  toggleActive
}
