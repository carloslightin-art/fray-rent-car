const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { errorDetails } = require('../utils/safeErrors')

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/vehicles')
    // Crear carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // Nombre único: vehicle-{id}-{timestamp}-{originalname}
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    const filename = `vehicle-${timestamp}${ext}`
    cb(null, filename)
  }
})

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se admiten imágenes (JPEG, PNG, WEBP, GIF)'), false)
  }
}

// Configurar multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
})

// Middleware para upload de imagen de vehículo
const uploadVehicleImage = upload.single('image')

// Controller para subir imagen de vehículo
const uploadVehicleImageController = (req, res) => {
  try {
    uploadVehicleImage(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          message: 'Error al subir imagen', 
          ...errorDetails(err)
        })
      }

      if (!req.file) {
        return res.status(400).json({ 
          message: 'No se ha proporcionado ninguna imagen' 
        })
      }

      const { vehicleId } = req.body
      
      // URL pública para acceder a la imagen
      const imageUrl = `/uploads/vehicles/${req.file.filename}`
      
      // Si se proporciona vehicleId, actualizar el vehículo
      if (vehicleId) {
        const { Vehicle } = require('../models')
        const vehicle = await Vehicle.findByPk(vehicleId)
        
        if (vehicle) {
          // Eliminar imagen anterior si existe y es local
          if (vehicle.image_url && vehicle.image_url.includes('/uploads/')) {
            const oldFilePath = path.join(__dirname, '../../', vehicle.image_url)
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath)
            }
          }
          
          await vehicle.update({ image_url: imageUrl })
          
          return res.json({
            message: 'Imagen actualizada correctamente',
            imageUrl,
            vehicle
          })
        }
      }

      res.json({
        message: 'Imagen subida correctamente',
        imageUrl
      })
    })
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error interno al procesar imagen', 
      ...errorDetails(error)
    })
  }
}

// Controller para eliminar imagen de vehículo
const deleteVehicleImageController = async (req, res) => {
  try {
    const { vehicleId } = req.params
    
    const { Vehicle } = require('../models')
    const vehicle = await Vehicle.findByPk(vehicleId)
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' })
    }

    if (!vehicle.image_url) {
      return res.status(400).json({ message: 'El vehículo no tiene imagen' })
    }

    // Eliminar archivo físico
    if (vehicle.image_url.includes('/uploads/')) {
      const filePath = path.join(__dirname, '../../', vehicle.image_url)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Actualizar base de datos
    await vehicle.update({ image_url: null })

    res.json({ message: 'Imagen eliminada correctamente' })
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error al eliminar imagen', 
      ...errorDetails(error)
    })
  }
}

module.exports = {
  uploadVehicleImage,
  uploadVehicleImageController,
  deleteVehicleImageController
}
