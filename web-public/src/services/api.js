import axios from 'axios'
// Usa VITE_API_URL para distinguir entre local y producción
// Local: http://localhost:5001/api
// Producción: https://api.fray-ren-card.com/api
const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? 'https://api.fray-ren-card.com/api' : 'http://localhost:5001/api'
)

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Vehicles API - solo vehículos activos
export const getVehicles = () => api.get('/vehicles/active')
export const getVehicleById = (id) => api.get(`/vehicles/${id}`)
export const getFeaturedVehicles = () => api.get('/vehicles/featured')

// Clients API
export const createClient = (data) => api.post('/clients', data)

// Reservations API
export const createReservation = (data) => api.post('/reservations', data)
export const sendContactMessage = (data) => api.post('/contact', data)

export default api
