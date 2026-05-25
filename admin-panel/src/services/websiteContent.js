import api from './api'

// Obtener todo el contenido
export const getAllContent = () => api.get('/website-content/all')

// Obtener contenido por sección
export const getContentBySection = (section) => api.get(`/website-content/section/${section}`)

// Actualizar un contenido
export const updateContent = (data) => api.put('/website-content/update', data)

// Actualizar sección completa
export const updateSectionContent = (data) => api.put('/website-content/section', data)

// Obtener vehículos destacados
export const getFeaturedVehicles = () => api.get('/website-content/featured-vehicles')

// Actualizar vehículos destacados
export const updateFeaturedVehicles = (vehicleIds) => api.put('/website-content/featured-vehicles', { vehicle_ids: vehicleIds })
