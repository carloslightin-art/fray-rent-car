const { errorDetails } = require('../utils/safeErrors')
const { WebsiteContent, Vehicle } = require('../models')

// Obtener todo el contenido web
exports.getAllContent = async (req, res) => {
  try {
    const contents = await WebsiteContent.findAll({
      order: [['section', 'ASC'], ['key_name', 'ASC']]
    })
    
    // Organizar por secciones
    const organized = {}
    contents.forEach(item => {
      if (!organized[item.section]) {
        organized[item.section] = {}
      }
      organized[item.section][item.key_name] = {
        value: item.value,
        type: item.value_type,
        is_active: item.is_active
      }
    })
    
    res.json(organized)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener contenido', ...errorDetails(error) })
  }
}

// Obtener contenido por sección
exports.getContentBySection = async (req, res) => {
  try {
    const { section } = req.params
    const contents = await WebsiteContent.findAll({
      where: { section },
      order: [['key_name', 'ASC']]
    })
    
    const organized = {}
    contents.forEach(item => {
      organized[item.key_name] = {
        value: item.value,
        type: item.value_type,
        is_active: item.is_active
      }
    })
    
    res.json(organized)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener contenido', ...errorDetails(error) })
  }
}

// Actualizar contenido (por section + key_name)
exports.updateContent = async (req, res) => {
  try {
    const { section, key_name, value, value_type, is_active } = req.body

    const [content, created] = await WebsiteContent.findOrCreate({
      where: { section, key_name },
      defaults: {
        value: value !== undefined ? String(value) : '',
        value_type: value_type || 'text',
        is_active: is_active !== undefined ? is_active : true
      }
    })

    if (!created) {
      await content.update({
        value: value !== undefined ? String(value) : content.value,
        value_type: value_type || content.value_type,
        is_active: is_active !== undefined ? is_active : content.is_active
      })
    }

    res.json({ message: created ? 'Contenido creado' : 'Contenido actualizado', content })
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar contenido', ...errorDetails(error) })
  }
}

// Actualizar múltiples contenidos de una sección
exports.updateSectionContent = async (req, res) => {
  try {
    const { section, contents } = req.body

    if (!contents || typeof contents !== 'object') {
      return res.status(400).json({ message: 'Se requiere un objeto con los contenidos' })
    }

    const updates = []
    for (const [key_name, data] of Object.entries(contents)) {
      if (data.value === undefined || data.value === null) continue

      const [found] = await WebsiteContent.findOrCreate({
        where: { section, key_name },
        defaults: {
          value: String(data.value),
          value_type: data.type || 'text',
          is_active: data.is_active !== undefined ? data.is_active : true
        }
      })

      if (found) {
        await found.update({
          value: data.value !== undefined ? String(data.value) : found.value,
          value_type: data.type || found.value_type,
          is_active: data.is_active !== undefined ? data.is_active : found.is_active
        })
      }

      updates.push(key_name)
    }

    res.json({ message: 'Contenido actualizado', updated: updates })
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar contenido', ...errorDetails(error) })
  }
}

// Obtener vehículos destacados (para fleet)
exports.getFeaturedVehicles = async (req, res) => {
  try {
    const content = await WebsiteContent.findOne({
      where: { section: 'fleet', key_name: 'featured_vehicles' }
    })
    
    if (!content || !content.value) {
      return res.json([])
    }
    
    const vehicleIds = JSON.parse(content.value)
    const vehicles = await Vehicle.findAll({
      where: { id: vehicleIds }
    })
    
    res.json(vehicles)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener vehículos destacados', ...errorDetails(error) })
  }
}

// Actualizar vehículos destacados
exports.updateFeaturedVehicles = async (req, res) => {
  try {
    const { vehicle_ids } = req.body
    
    if (!Array.isArray(vehicle_ids)) {
      return res.status(400).json({ message: 'vehicle_ids debe ser un array' })
    }
    
    await WebsiteContent.update(
      { value: JSON.stringify(vehicle_ids) },
      { where: { section: 'fleet', key_name: 'featured_vehicles' } }
    )
    
    res.json({ message: 'Vehículos destacados actualizados' })
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar vehículos', ...errorDetails(error) })
  }
}
