/**
 * HELPER CENTRALIZADO PARA IMÁGENES DE VEHÍCULOS
 * Función única para construcción de URLs y fallback controlado
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

/**
 * Construye la URL final de imagen para un vehículo
 * @param {string} imageUrl - URL de imagen desde la API
 * @param {number} vehicleId - ID del vehículo (para debugging)
 * @returns {string} URL válida o fallback controlado
 */
export function getVehicleImageUrl(imageUrl, vehicleId) {
  // Si no hay URL, usar fallback genérico
  if (!imageUrl) {
    return '/images/vehicles/car-1.jpg'
  }

  // Si es una URL completa del backend (starts with /uploads)
  if (imageUrl.startsWith('/uploads')) {
    return `${API_BASE_URL.replace('/api', '')}${imageUrl}`
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
  return '/images/vehicles/car-1.jpg'
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
