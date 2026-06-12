import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const {
  isDemoVehicleImage,
  serializeVehicle,
  uploadFileExists
} = require('../backend/src/utils/vehicleImages.js')

const uploadDir = path.resolve('backend/uploads/vehicles')
const realUploadPath = path.join(uploadDir, 'real-test-image.png')
fs.mkdirSync(uploadDir, { recursive: true })
fs.writeFileSync(realUploadPath, Buffer.from([0x89, 0x50, 0x4e, 0x47]))

try {
  assert.equal(isDemoVehicleImage('/images/vehicles/car-1.jpg'), true)
  assert.equal(isDemoVehicleImage('/images/vehicles/car-3.jpg'), true)
  assert.equal(isDemoVehicleImage('/uploads/vehicles/real-test-image.png'), false)
  assert.equal(uploadFileExists('/uploads/vehicles/real-test-image.png'), true)
  assert.equal(uploadFileExists('/uploads/vehicles/missing-test-image.png'), false)

  const onlyDemo = serializeVehicle({
    id: 1,
    image_url: '/images/vehicles/car-3.jpg',
    gallery_images: []
  })
  assert.equal(
    onlyDemo.image_url,
    null,
    'si solo hay demo, el API no debe exponerla como imagen real principal'
  )
  assert.deepEqual(
    onlyDemo.gallery_images,
    [],
    'las imágenes demo no deben contarse como galería real'
  )

  const uploadPlusDemo = serializeVehicle({
    id: 1,
    image_url: '/images/vehicles/car-3.jpg',
    gallery_images: ['/images/vehicles/car-3.jpg', '/uploads/vehicles/real-test-image.png']
  })
  assert.equal(
    uploadPlusDemo.image_url,
    '/uploads/vehicles/real-test-image.png',
    'si hay una foto real subida, debe pasar a ser principal aunque antes hubiera demo'
  )
  assert.deepEqual(
    uploadPlusDemo.gallery_images,
    ['/uploads/vehicles/real-test-image.png'],
    'la galería serializada debe contener solo fotos reales subidas'
  )

  const missingUpload = serializeVehicle({
    id: 1,
    image_url: '/uploads/vehicles/missing-test-image.png',
    gallery_images: ['/uploads/vehicles/missing-test-image.png', '/uploads/vehicles/real-test-image.png']
  })
  assert.equal(
    missingUpload.image_url,
    '/uploads/vehicles/real-test-image.png',
    'si una foto subida ya no existe en disco/volumen, no debe salir como principal'
  )
  assert.deepEqual(
    missingUpload.gallery_images,
    ['/uploads/vehicles/real-test-image.png'],
    'la galería debe filtrar uploads rotos para evitar fallback a muestra en frontend'
  )

  console.log('backend vehicle image behavior OK')
} finally {
  fs.rmSync(realUploadPath, { force: true })
}
