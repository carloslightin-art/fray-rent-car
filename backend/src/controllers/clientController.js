const { errorDetails } = require('../utils/safeErrors')
const { Client } = require('../models')

const handleSequelizeError = (error) => {
  if (error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeValidationError') {
    const messages = error.errors.map(err => {
      if (err.path === 'email') {
        return 'El email ya está registrado'
      }
      if (err.path === 'license_number') {
        return 'Ya existe un cliente con ese número de licencia'
      }
      return err.message
    })
    return { status: 400, message: messages.join(', ') }
  }
  return { status: 500, message: error.message }
}

const listClients = async (_req, res) => {
  try {
    const clients = await Client.findAll({ order: [['id', 'DESC']] })
    return res.json(clients)
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar clientes', ...errorDetails(error) })
  }
}

const getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id)
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }
    return res.json(client)
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener cliente', ...errorDetails(error) })
  }
}

const createClient = async (req, res) => {
  try {
    const { name, email, phone, license_number } = req.body

    if (!name || !email || !phone || !license_number) {
      return res
        .status(400)
        .json({ message: 'name, email, phone y license_number son obligatorios' })
    }

    const client = await Client.create({ name, email, phone, license_number })
    return res.status(201).json(client)
  } catch (error) {
    const { status, message } = handleSequelizeError(error)
    return res.status(status).json({ message: status === 400 ? message : 'Error al crear cliente', error: message })
  }
}

const updateClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id)
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    await client.update(req.body)
    return res.json(client)
  } catch (error) {
    const { status, message } = handleSequelizeError(error)
    return res.status(status).json({ message: status === 400 ? message : 'Error al actualizar cliente', error: message })
  }
}

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id)
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    await client.destroy()
    return res.json({ message: 'Cliente eliminado correctamente' })
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar cliente', ...errorDetails(error) })
  }
}

module.exports = {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
}
