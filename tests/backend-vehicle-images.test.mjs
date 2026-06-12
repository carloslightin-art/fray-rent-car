import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const {
  isDemoVehicleImage,
  serializeVehicle
} = require('../backend/src/utils/vehicleImages.js')

assert.equal(isDemoVehicleImage('/images/vehicles/car-1.jpg'), true)
assert.equal(isDemoVehicleImage('/images/vehicles/car-3.jpg'), true)
assert.equal(isDemoVehicleImage('/uploads/vehicles/real.png'), false)

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
  gallery_images: ['/images/vehicles/car-3.jpg', '/uploads/vehicles/real.png']
})
assert.equal(
  uploadPlusDemo.image_url,
  '/uploads/vehicles/real.png',
  'si hay una foto real subida, debe pasar a ser principal aunque antes hubiera demo'
)
assert.deepEqual(
  uploadPlusDemo.gallery_images,
  ['/uploads/vehicles/real.png'],
  'la galería serializada debe contener solo fotos reales subidas'
)

console.log('backend vehicle image behavior OK')
