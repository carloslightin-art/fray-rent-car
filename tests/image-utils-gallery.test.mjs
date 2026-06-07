import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const sourcePath = new URL('../web-public/src/utils/imageUtils.js', import.meta.url)
const source = await readFile(sourcePath, 'utf8')
const transformed = source.replace("import.meta.env.VITE_API_URL || 'http://localhost:5001/api'", "'http://localhost:5001/api'")
const moduleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(transformed)}`
const { getVehicleGalleryUrls } = await import(moduleUrl)

const oneRealImage = getVehicleGalleryUrls({
  id: 99,
  image_url: '/uploads/vehicles/real-car.jpg',
  gallery_images: []
})

assert.deepEqual(
  oneRealImage,
  ['http://localhost:5001/uploads/vehicles/real-car.jpg'],
  'si hay una sola foto real, debe mostrar solo esa foto y no inventar fallbacks'
)

const threeRealImages = getVehicleGalleryUrls({
  id: 100,
  image_url: '/uploads/vehicles/main.jpg',
  gallery_images: ['/uploads/vehicles/side.jpg', '/uploads/vehicles/interior.jpg']
})

assert.deepEqual(
  threeRealImages,
  [
    'http://localhost:5001/uploads/vehicles/main.jpg',
    'http://localhost:5001/uploads/vehicles/side.jpg',
    'http://localhost:5001/uploads/vehicles/interior.jpg'
  ],
  'si hay tres fotos reales, debe mostrar las tres fotos reales'
)

const duplicatedMain = getVehicleGalleryUrls({
  id: 101,
  image_url: '/uploads/vehicles/main.jpg',
  gallery_images: ['/uploads/vehicles/main.jpg']
})

assert.deepEqual(
  duplicatedMain,
  ['http://localhost:5001/uploads/vehicles/main.jpg'],
  'si la principal también viene en galería, no debe duplicarla ni rellenar con inventadas'
)

const noRealImages = getVehicleGalleryUrls({ id: 1, gallery_images: [] })
assert.deepEqual(
  noRealImages,
  ['/images/vehicles/car-1.jpg'],
  'si no hay fotos reales, debe usar una sola imagen fallback para no romper la tarjeta'
)

const legacyFallbackGallery = getVehicleGalleryUrls({
  id: 3,
  image: '/images/vehicles/car-3.jpg',
  gallery_images: ['/images/vehicles/car-3.jpg', '/images/vehicles/car-1.jpg', '/images/vehicles/car-2.jpg']
})

assert.deepEqual(
  legacyFallbackGallery,
  ['/images/vehicles/car-3.jpg'],
  'si la galería trae imágenes locales fallback/demo, no debe contarlas como fotos reales ni mostrar 3 fotos inventadas'
)

const uploadedPlusLegacyFallbacks = getVehicleGalleryUrls({
  id: 4,
  image_url: '/uploads/vehicles/original.jpg',
  gallery_images: ['/uploads/vehicles/original.jpg', '/images/vehicles/car-1.jpg', '/images/vehicles/car-2.jpg']
})

assert.deepEqual(
  uploadedPlusLegacyFallbacks,
  ['http://localhost:5001/uploads/vehicles/original.jpg'],
  'si hay una foto subida y además fallbacks viejos en galería, debe mostrar solo la foto subida'
)

console.log('image utils gallery behavior OK')
