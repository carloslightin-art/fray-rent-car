import axios from 'axios'

// Usar el mismo API URL que el servicio principal
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Obtener todo el contenido web
export const getWebsiteContent = () => api.get('/website-content/all')

// Obtener contenido por sección
export const getWebsiteSection = (section) => api.get(`/website-content/section/${section}`)

// Obtener vehículos destacados
export const getFeaturedVehicles = () => api.get('/website-content/featured-vehicles')

export default api
