import axios from 'axios'
// Usa VITE_API_URL para distinguir entre local y producción
// Local: http://localhost:5001/api
// Producción: https://api.fray-rent-car.com/api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const login = (credentials) => api.post('/auth/login', credentials)
export const getMe = () => api.get('/auth/me')

// Vehicles API
export const getVehicles = () => api.get('/vehicles')
export const getActiveVehicles = () => api.get('/vehicles/active')
export const getFeaturedVehicles = () => api.get('/vehicles/featured')
export const createVehicle = (data) => api.post('/vehicles', data)
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data)
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`)
export const toggleVehicleFeatured = (id) => api.patch(`/vehicles/${id}/featured`)
export const toggleVehicleActive = (id) => api.patch(`/vehicles/${id}/active`)

// Clients API
export const getClients = () => api.get('/clients')
export const createClient = (data) => api.post('/clients', data)
export const updateClient = (id, data) => api.put(`/clients/${id}`, data)
export const deleteClient = (id) => api.delete(`/clients/${id}`)

// Reservations API
export const getReservations = () => api.get('/reservations')
export const getReservationById = (id) => api.get(`/reservations/${id}`)
export const updateReservationStatus = (id, status) => api.patch(`/reservations/${id}/status`, { status })

// Upload API
export const uploadVehicleImage = (vehicleId, formData) => {
  return api.post('/upload/vehicle', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
export const deleteVehicleImage = (vehicleId, imageUrl) => api.delete(`/upload/vehicle/${vehicleId}`, {
  data: imageUrl ? { imageUrl } : undefined
})

// Users API
export const getUsers = () => api.get('/users')
export const getUserById = (id) => api.get(`/users/${id}`)
export const createUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)
export const changeUserPassword = (id, newPassword) => api.patch(`/users/${id}/password`, { newPassword })
export const toggleUserActive = (id) => api.patch(`/users/${id}/active`)

// Dashboard API
export const getDashboardMetrics = () => api.get('/dashboard/metrics')

// Reports API
export const getReservationsReport = (params) => api.get('/dashboard/reports/reservations', { params })
export const getClientsReport = () => api.get('/dashboard/reports/clients')
export const getVehiclesReport = (params) => api.get('/dashboard/reports/vehicles', { params })

// Website Content API
export const getWebsiteSection = (section) => api.get(`/website-content/section/${section}`)
export const updateWebsiteSection = (section, contents) => 
  api.put('/website-content/section', { section, contents })

export default api
