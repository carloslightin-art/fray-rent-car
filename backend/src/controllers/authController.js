const { errorDetails } = require('../utils/safeErrors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son obligatorios' })
    }

    if (!process.env.JWT_SECRET) {
      console.error('LOGIN ERROR: JWT_SECRET no está configurado en las variables de entorno')
      return res.status(500).json({ message: 'Error de configuración del servidor' })
    }

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    if (!user.password) {
      console.error('LOGIN ERROR: usuario', user.email, 'no tiene password hash en BD')
      return res.status(500).json({ message: 'Error de autenticación del usuario' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    )

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('LOGIN ERROR:', error.message)
    if (error.message && error.message.includes('secretOrPrivateKey')) {
      console.error('LOGIN: JWT_SECRET no válido. Configúralo en las variables de entorno.')
      return res.status(500).json({ message: 'Error de configuración del servidor' })
    }
    return res.status(500).json({ message: 'Error al iniciar sesión', ...errorDetails(error) })
  }
}

const profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'created_at']
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    return res.json(user)
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener perfil', ...errorDetails(error) })
  }
}

module.exports = {
  login,
  profile
}
