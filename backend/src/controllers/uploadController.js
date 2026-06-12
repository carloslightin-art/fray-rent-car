const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { errorDetails } = require('../utils/safeErrors')
const { parseVehicleGallery, uniqueImages, realVehicleImages, isDemoVehicleImage, serializeVehicle } = require('../utils/vehicleImages')

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
    // Extensión derivada del mimetype (nunca del nombre original) para que
    // un archivo malicioso no pueda guardarse como .html/.svg y servirse
    // con un Content-Type ejecutable desde /uploads.
    const extByMime = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif'
    }
    const ext = extByMime[file.mimetype] || '.jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    cb(null, `vehicle-${timestamp}-${random}${ext}`)
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

const isSupportedImageFile = (filePath) => {
  const buffer = fs.readFileSync(filePath)
  if (buffer.length < 12) return false

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  const isPng = buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const header = buffer.slice(0, 12).toString('ascii')
  const isGif = header.startsWith('GIF87a') || header.startsWith('GIF89a')
  const isWebp = header.startsWith('RIFF') && buffer.slice(8, 12).toString('ascii') === 'WEBP'

  return isJpeg || isPng || isGif || isWebp
}

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

      if (!isSupportedImageFile(req.file.path)) {
        fs.unlinkSync(req.file.path)
        return res.status(400).json({
          message: 'El archivo no es una imagen válida. Sube un JPEG, PNG, WEBP o GIF real.'
        })
      }

      const { vehicleId, mode = 'append' } = req.body
      
      // URL pública para acceder a la imagen
      const imageUrl = `/uploads/vehicles/${req.file.filename}`
      
      // Si se proporciona vehicleId, actualizar el vehículo
      if (vehicleId) {
        const { Vehicle } = require('../models')
        const vehicle = await Vehicle.findByPk(vehicleId)
        
        if (vehicle) {
          const currentGallery = parseVehicleGallery(vehicle.gallery_images)
          const existingImages = mode === 'replace'
            ? []
            : uniqueImages([vehicle.image_url, ...currentGallery])
          const nextGallery = uniqueImages([...realVehicleImages(existingImages), imageUrl])
          const shouldReplacePrimary = !vehicle.image_url || isDemoVehicleImage(vehicle.image_url) || mode === 'replace'

          await vehicle.update({
            image_url: shouldReplacePrimary ? imageUrl : vehicle.image_url,
            gallery_images: nextGallery
          })
          
          return res.json({
            message: 'Imagen añadida correctamente',
            imageUrl,
            galleryImages: nextGallery,
            vehicle: serializeVehicle(vehicle)
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

    const { imageUrl } = req.body || {}
    const currentGallery = parseVehicleGallery(vehicle.gallery_images)
    const targetImage = imageUrl || vehicle.image_url

    if (!targetImage) {
      return res.status(400).json({ message: 'El vehículo no tiene imagen' })
    }

    if (imageUrl && ![vehicle.image_url, ...currentGallery].includes(imageUrl)) {
      return res.status(404).json({ message: 'La foto no pertenece a este vehículo' })
    }

    // Eliminar archivo físico solo si es un upload interno.
    if (targetImage.includes('/uploads/')) {
      const filePath = path.join(__dirname, '../../', targetImage)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Actualizar base de datos: quitar solo la foto seleccionada
    // y promover la siguiente foto de galería como principal si hace falta.
    const remainingGallery = currentGallery.filter((url) => url !== targetImage)

    await vehicle.update({
      image_url: vehicle.image_url === targetImage ? (remainingGallery[0] || null) : vehicle.image_url,
      gallery_images: remainingGallery
    })

    res.json({ message: 'Foto eliminada correctamente', imageUrl: targetImage, vehicle: serializeVehicle(vehicle) })
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
