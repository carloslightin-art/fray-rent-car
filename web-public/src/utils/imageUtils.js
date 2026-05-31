/**
 * HELPER CENTRALIZADO PARA IMÁGENES DE VEHÍCULOS
 * Función única para construcción de URLs y fallback controlado
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
const API_ORIGIN_URL = API_BASE_URL.replace(/\/api\/?$/, '')
const LOCAL_VEHICLE_FALLBACKS = [
  '/images/vehicles/car-1.jpg',
  '/images/vehicles/car-2.jpg',
  '/images/vehicles/car-3.jpg'
]

export function getFallbackVehicleImageUrl(vehicleId = 1) {
  const numericId = Number(vehicleId) || 1
  return LOCAL_VEHICLE_FALLBACKS[Math.abs(numericId - 1) % LOCAL_VEHICLE_FALLBACKS.length]
}

/**
 * Construye la URL final de imagen para un vehículo
 * @param {string} imageUrl - URL de imagen desde la API
 * @param {number} vehicleId - ID del vehículo (para debugging)
 * @returns {string} URL válida o fallback controlado
 */
export function getVehicleImageUrl(imageUrl, vehicleId) {
  // Si no hay URL, usar fallback genérico
  if (!imageUrl) {
    return getFallbackVehicleImageUrl(vehicleId)
  }

  // Si es una URL completa del backend (starts with /uploads)
  if (imageUrl.startsWith('/uploads')) {
    return `${API_ORIGIN_URL}${imageUrl}`
  }

  // Si ya es una URL completa (http/https)
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }

  // Si es una ruta relativa local
  if (imageUrl.startsWith('/')) {
    return imageUrl
  }

  // Fallback final
  console.warn(`[ImageUtils] Invalid image URL for vehicle ${vehicleId}:`, imageUrl)
  return getFallbackVehicleImageUrl(vehicleId)
}

export function getVehicleGalleryUrls(vehicle = {}, minimum = 3) {
  const gallery = Array.isArray(vehicle.gallery_images) ? vehicle.gallery_images : []
  const images = [vehicle.image || vehicle.image_url, ...gallery]
    .filter(Boolean)
    .map((url) => getVehicleImageUrl(url, vehicle.id))

  const startIndex = Math.abs((Number(vehicle.id) || 1) - 1)
  const fallbacks = LOCAL_VEHICLE_FALLBACKS.map((_, index) => LOCAL_VEHICLE_FALLBACKS[(startIndex + index) % LOCAL_VEHICLE_FALLBACKS.length])
  return Array.from(new Set([...images, ...fallbacks])).slice(0, minimum)
}

export function formatVehicleDisplayName(name = 'Flota premium') {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase())
}

export function formatVehiclePrice(price = 50) {
  const value = Number(price)
  if (!Number.isFinite(value)) return '50'
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '')
}

/**
 * Opcción: Valida si una URL de imagen es accesible
 * @param {string} url - URL a validar
 * @returns {Promise<boolean>}
 */
export async function validateImageUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    return false
  }
}
