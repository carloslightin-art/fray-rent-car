import { useState, useEffect } from 'react'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, toggleVehicleFeatured, toggleVehicleActive, uploadVehicleImage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Star, StarOff, Plus, Edit2, Trash2, X, Check, XCircle, Upload, Loader2 } from 'lucide-react'

function Vehicles() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price_per_day: '',
    status: 'available',
    category: 'economico',
    image_url: '',
    gallery_images: [],
    seats: 5,
    vehicle_type: 'Económico',
    insurance_included: true,
    description: '',
    is_active: true,
    is_featured: false,
    sort_order: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  // Archivos de galería seleccionados (para auto-upload tras crear vehículo)
  const [selectedImageFiles, setSelectedImageFiles] = useState([])

  const isOwner = user?.role === 'owner'
  const isWorker = user?.role === 'worker'

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await getVehicles()
      setVehicles(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError('Error al cargar los vehículos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isOwner) {
      alert('Solo el owner puede modificar vehículos')
      return
    }

    setIsSubmitting(true)

    // No enviar previews base64; las fotos nuevas se suben por separado
    const { image_url, gallery_images, ...restData } = formData
    const data = {
      ...restData,
      year: parseInt(formData.year),
      price_per_day: parseFloat(formData.price_per_day),
      sort_order: parseInt(formData.sort_order) || 0,
      seats: parseInt(formData.seats) || 5,
      gallery_images: Array.isArray(gallery_images)
        ? gallery_images.filter((url) => url && !url.startsWith('data:'))
        : []
    }

    // Si image_url es una URL real (no base64), enviarla
    if (image_url && !image_url.startsWith('data:')) {
      data.image_url = image_url
    }

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, data)
      } else {
        const response = await createVehicle(data)
        // Auto-upload image si se seleccionó uno al crear vehículo
        if (selectedImageFiles.length > 0 && response.data?.id) {
          for (const file of selectedImageFiles.slice(0, 6)) {
            const uploadFormData = new FormData()
            uploadFormData.append('image', file)
            uploadFormData.append('vehicleId', response.data.id)
            uploadFormData.append('mode', 'append')
            await uploadVehicleImage(response.data.id, uploadFormData)
          }
        }
      }
      await fetchVehicles()
      resetForm()
    } catch (err) {
      console.error('Error saving vehicle:', err)
      alert(err.response?.data?.message || 'Error al guardar el vehículo')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setSelectedImageFiles([])
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      price_per_day: vehicle.price_per_day,
      status: vehicle.status,
      category: vehicle.category || 'economico',
      image_url: vehicle.image_url || '',
      gallery_images: Array.isArray(vehicle.gallery_images) ? vehicle.gallery_images : [],
      seats: vehicle.seats || 5,
      vehicle_type: vehicle.vehicle_type || vehicle.category || 'Económico',
      insurance_included: vehicle.insurance_included !== false,
      description: vehicle.description || '',
      is_active: vehicle.is_active !== false,
      is_featured: vehicle.is_featured === true,
      sort_order: vehicle.sort_order || 0
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!isOwner) {
      alert('Solo el owner puede eliminar vehículos')
      return false
    }

    if (!confirm('¿Estás seguro de eliminar este vehículo?')) return false

    try {
      await deleteVehicle(id)
      await fetchVehicles()
      return true
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      alert(err.response?.data?.message || 'Error al eliminar el vehículo')
      return false
    }
  }

  const handleToggleFeatured = async (id) => {
    if (!isOwner) {
      alert('Solo el owner puede modificar vehículos')
      return
    }
    try {
      await toggleVehicleFeatured(id)
      await fetchVehicles()
    } catch (err) {
      console.error('Error toggling featured:', err)
      alert(err.response?.data?.message || 'Error al actualizar destacado')
    }
  }

  const handleToggleActive = async (id) => {
    if (!isOwner) {
      alert('Solo el owner puede modificar vehículos')
      return
    }
    try {
      await toggleVehicleActive(id)
      await fetchVehicles()
    } catch (err) {
      console.error('Error toggling active:', err)
      alert(err.response?.data?.message || 'Error al actualizar estado')
    }
  }

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price_per_day: '',
      status: 'available',
      category: 'economico',
      image_url: '',
      gallery_images: [],
      seats: 5,
      vehicle_type: 'Económico',
      insurance_included: true,
      description: '',
      is_active: true,
      is_featured: false,
      sort_order: 0
    })
    setEditingVehicle(null)
    setShowForm(false)
    setSelectedImageFiles([])
  }

  // Manejar cambio de archivos de galería
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (!isOwner) {
      alert('Solo el owner puede modificar vehículos')
      return
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const invalidFile = files.find((file) => !validTypes.includes(file.type))
    if (invalidFile) {
      alert('Tipo de archivo no válido. Solo se admiten imágenes (JPEG, PNG, WEBP, GIF)')
      return
    }

    const tooLarge = files.find((file) => file.size > 5 * 1024 * 1024)
    if (tooLarge) {
      alert('Una imagen es demasiado grande. Máximo 5MB por foto')
      return
    }

    const filesToUse = files.slice(0, 6)

    if (editingVehicle) {
      setUploadingImage(true)
      try {
        let latestVehicle = null
        for (const file of filesToUse) {
          const uploadFormData = new FormData()
          uploadFormData.append('image', file)
          uploadFormData.append('vehicleId', editingVehicle.id)
          uploadFormData.append('mode', 'append')
          const response = await uploadVehicleImage(editingVehicle.id, uploadFormData)
          latestVehicle = response.data?.vehicle
        }
        if (latestVehicle) {
          setFormData(prev => ({
            ...prev,
            image_url: latestVehicle.image_url || prev.image_url,
            gallery_images: latestVehicle.gallery_images || prev.gallery_images
          }))
        }
        await fetchVehicles()
        alert('Fotos añadidas correctamente')
      } catch (err) {
        console.error('Error uploading images:', err)
        alert(err.response?.data?.message || 'Error al subir fotos')
      } finally {
        setUploadingImage(false)
        e.target.value = ''
      }
    } else {
      setSelectedImageFiles(filesToUse)
      const previews = await Promise.all(filesToUse.map((file) => new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target.result)
        reader.readAsDataURL(file)
      })))
      setFormData(prev => ({
        ...prev,
        image_url: previews[0] || '',
        gallery_images: previews
      }))
    }
  }

  // Helper para normalizar URLs de imágenes
  const getVehicleImageUrl = (url) => {
    if (!url || url === '') return null
    // Si ya es URL absoluta, retornarla directamente
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // Si es asset público del frontend/admin, servirlo desde Vite directamente
    if (url.startsWith('/images/')) {
      return url
    }
    // Si comienza con /uploads (ruta relativa del backend)
    if (url.startsWith('/uploads')) {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '')
      return `${API_URL}${url}`
    }
    // Para cualquier otra ruta relativa
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '')
    return `${API_URL}/${url}`
  }

  const getFallbackVehicleImage = (vehicle) => {
    const fallbackImages = [
      '/images/vehicles/car-1.jpg',
      '/images/vehicles/car-2.jpg',
      '/images/vehicles/car-3.jpg'
    ]
    const index = Math.abs(Number(vehicle?.id || 1) - 1) % fallbackImages.length
    return fallbackImages[index]
  }

  const getDisplayVehicleImage = (vehicle) => {
    const gallery = Array.isArray(vehicle?.gallery_images) ? vehicle.gallery_images : []
    return getVehicleImageUrl(vehicle?.image_url || gallery[0]) || getFallbackVehicleImage(vehicle)
  }

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Disponible',
      maintenance: 'Mantenimiento',
      reserved: 'Reservado'
    }
    return labels[status] || status
  }

  const getStatusClass = (status) => {
    const classes = {
      available: 'bg-green-500/20 text-green-400',
      maintenance: 'bg-yellow-500/20 text-yellow-400',
      reserved: 'bg-red-500/20 text-red-400'
    }
    return classes[status] || 'bg-gray-500/20 text-gray-400'
  }

  const getCategoryLabel = (category) => {
    const labels = {
      economico: 'Económico',
      suv: 'SUV',
      premium: 'Premium',
      luxury: 'Lujo'
    }
    return labels[category] || category
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-luxuryText">Vehículos</h2>
          <p className="text-sm text-luxuryMuted">Gestión de la flota de vehículos.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchVehicles}
            disabled={loading}
            className="ghost-btn text-sm"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          {isOwner && (
            <button 
              onClick={() => {
                if (showForm) {
                  resetForm()
                } else {
                  setSelectedImageFiles([])
                  setShowForm(true)
                }
              }}
              className="gold-btn text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Cancelar' : 'Nuevo vehículo'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-luxuryDanger/30 bg-luxuryDanger/10 p-4">
          <p className="text-luxuryDanger">{error}</p>
          <button onClick={fetchVehicles} className="gold-btn mt-2 text-sm">
            Reintentar
          </button>
        </div>
      )}

      {showForm && isOwner && (
        <form onSubmit={handleSubmit} className="panel-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-luxuryText">
              {editingVehicle ? 'Editar vehículo' : 'Nuevo vehículo'}
            </h3>
            <button type="button" onClick={resetForm} className="text-luxuryMuted hover:text-luxuryText">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Marca */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Marca *</label>
              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="input-luxury"
                required
                placeholder="Ej: Toyota"
              />
            </div>
            
            {/* Modelo */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Modelo *</label>
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input-luxury"
                required
                placeholder="Ej: Corolla"
              />
            </div>
            
            {/* Año */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Año *</label>
              <input
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                className="input-luxury"
                required
                min="2000"
                max="2030"
              />
            </div>
            
            {/* Precio */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Precio/día (US$) *</label>
              <input
                name="price_per_day"
                type="number"
                step="0.01"
                value={formData.price_per_day}
                onChange={handleChange}
                className="input-luxury"
                required
                placeholder="Ej: 45.00"
              />
            </div>
            
            {/* Categoría */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Categoría</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-luxury"
              >
                <option value="economico">Económico</option>
                <option value="suv">SUV</option>
                <option value="premium">Premium</option>
                <option value="luxury">Lujo</option>
              </select>
            </div>
            
            {/* Estado */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-luxury"
              >
                <option value="available">Disponible</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="reserved">Reservado</option>
              </select>
            </div>

            {/* Plazas */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Número de plazas</label>
              <input
                name="seats"
                type="number"
                min="1"
                max="15"
                value={formData.seats}
                onChange={handleChange}
                className="input-luxury"
                placeholder="Ej: 5"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Tipo de vehículo</label>
              <input
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                className="input-luxury"
                placeholder="Ej: Compacto, SUV, Sedán"
              />
            </div>
            
            {/* Orden */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Orden de aparición</label>
              <input
                name="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={handleChange}
                className="input-luxury"
                min="0"
                placeholder="0"
              />
            </div>
            
            {/* Galería */}
            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm text-luxuryMuted">Galería del vehículo</label>
              <div className="flex gap-3 items-start">
                {/* Input file */}
                <div className="flex-1">
                  <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formData.image_url ? 'border-luxuryGold/30 hover:border-luxuryGold/50' : 'border-luxuryGold/50 hover:border-luxuryGold'} ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-luxuryGold" />
                        <span className="text-sm text-luxuryMuted">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-luxuryGold" />
                        <span className="text-sm text-luxuryText">
                          {formData.gallery_images?.length ? 'Añadir más fotos' : 'Subir fotos'}
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      disabled={!isOwner || uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-luxuryMuted mt-1">Mínimo recomendado: 3 fotos (frontal, lateral e interior). Máx 5MB por foto.</p>
                </div>
                {/* Previews */}
                {formData.gallery_images?.length > 0 && (
                  <div className="grid w-full max-w-md grid-cols-3 gap-2">
                    {formData.gallery_images.slice(0, 6).map((url, index) => (
                      <div key={`${url}-${index}`} className="relative h-24 rounded-lg overflow-hidden border border-luxuryGold/20 bg-luxuryPanel">
                        <img 
                          src={getVehicleImageUrl(url) || url} 
                          alt={`Foto ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = getFallbackVehicleImage({ id: index + 1 })
                          }}
                        />
                        <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-luxuryGold">
                          {index === 0 ? 'Principal' : `Foto ${index + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Checkboxes */}
            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="insurance_included"
                  checked={formData.insurance_included}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-luxuryGold/30 bg-luxuryPanel text-luxuryGold focus:ring-luxuryGold"
                />
                <span className="text-sm text-luxuryText">Seguro incluido</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-luxuryGold/30 bg-luxuryPanel text-luxuryGold focus:ring-luxuryGold"
                />
                <span className="text-sm text-luxuryText">Activo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-luxuryGold/30 bg-luxuryPanel text-luxuryGold focus:ring-luxuryGold"
                />
                <span className="text-sm text-luxuryText">Destacado en Home</span>
              </label>
            </div>
            
            {/* Descripción */}
            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm text-luxuryMuted">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-luxury"
                rows={2}
                placeholder="Descripción opcional del vehículo..."
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="gold-btn text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
            <button 
              type="button" 
              onClick={resetForm}
              className="ghost-btn text-sm"
            >
              Cancelar
            </button>
            {editingVehicle && isOwner && (
              <button
                type="button"
                onClick={async () => {
                  const deleted = await handleDelete(editingVehicle.id)
                  if (deleted) resetForm()
                }}
                className="rounded-lg border border-luxuryDanger/40 px-4 py-2 text-sm font-semibold text-luxuryDanger transition-colors hover:border-luxuryDanger hover:bg-luxuryDanger/10"
              >
                Eliminar coche
              </button>
            )}
          </div>
        </form>
      )}

      {loading && !error ? (
        <div className="panel-card p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-luxuryGold border-t-transparent"></div>
          <p className="mt-4 text-luxuryMuted">Cargando vehículos...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <article key={vehicle.id} className={`panel-card p-4 relative ${!vehicle.is_active ? 'opacity-50' : ''}`}>
              {/* Badge destacado */}
              {vehicle.is_featured && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                    <Star className="w-3 h-3" /> Destacado
                  </span>
                </div>
              )}
              
              {/* Imagen */}
              <div className="aspect-[16/10] rounded-lg overflow-hidden bg-luxuryPanel mb-3 border border-luxuryGold/10">
                <img 
                  src={getDisplayVehicleImage(vehicle)} 
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = getFallbackVehicleImage(vehicle)
                  }}
                />
              </div>
              
              {/* Info */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-luxuryGold font-bold">{vehicle.brand}</p>
                  <h3 className="mt-1 text-base font-bold text-luxuryText truncate">{vehicle.model}</h3>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${getStatusClass(vehicle.status)}`}>
                  {getStatusLabel(vehicle.status)}
                </span>
              </div>
              
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-luxuryMuted">
                <span className="rounded-full bg-white/5 px-2 py-1">{vehicle.year}</span>
                <span className="rounded-full bg-white/5 px-2 py-1">{vehicle.seats || 5} plazas</span>
                <span className="rounded-full bg-white/5 px-2 py-1">{vehicle.vehicle_type || getCategoryLabel(vehicle.category)}</span>
                <span className="rounded-full bg-white/5 px-2 py-1">{vehicle.insurance_included === false ? 'Seguro opcional' : 'Seguro incluido'}</span>
                {vehicle.gallery_images?.length > 0 && (
                  <span className="rounded-full bg-luxuryGold/10 px-2 py-1 text-luxuryGold">{vehicle.gallery_images.length} {vehicle.gallery_images.length === 1 ? 'foto' : 'fotos'}</span>
                )}
                {vehicle.sort_order > 0 && (
                  <span className="rounded-full bg-white/5 px-2 py-1">Orden: {vehicle.sort_order}</span>
                )}
              </div>
              
              <div className="mt-3 flex items-center justify-between border-t border-luxuryGold/10 pt-3">
                <p className="text-luxuryGold">
                  <span className="text-xl font-bold">US${vehicle.price_per_day}</span>
                  <span className="text-xs text-luxuryMuted">/día</span>
                </p>
                <div className="flex items-center gap-1">
                  {/* Toggle Activo */}
                  {isOwner ? (
                    <button
                      onClick={() => handleToggleActive(vehicle.id)}
                      className={`p-2 transition-colors ${vehicle.is_active ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
                      title={vehicle.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {vehicle.is_active ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                  ) : (
                    <span className={`px-2 py-1 text-xs rounded-full ${vehicle.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {vehicle.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  )}
                  {/* Toggle Destacado */}
                  {isOwner ? (
                    <button
                      onClick={() => handleToggleFeatured(vehicle.id)}
                      className={`p-2 transition-colors ${vehicle.is_featured ? 'text-yellow-500 hover:text-yellow-400' : 'text-luxuryMuted hover:text-yellow-500'}`}
                      title={vehicle.is_featured ? 'Quitar de Home' : 'Destacar en Home'}
                    >
                      {vehicle.is_featured ? <Star className="w-4 h-4 fill-yellow-500" /> : <StarOff className="w-4 h-4" />}
                    </button>
                  ) : (
                    vehicle.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  {/* Editar */}
                  {isOwner && (
                    <button 
                      onClick={() => handleEdit(vehicle)}
                      className="p-2 text-luxuryMuted hover:text-luxuryGold transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {/* Eliminar */}
                  {isOwner && (
                    <button 
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2 text-luxuryMuted hover:text-luxuryDanger transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
          
          {vehicles.length === 0 && !error && (
            <div className="panel-card p-8 text-center md:col-span-2 lg:col-span-3">
              <p className="text-luxuryMuted">No hay vehículos registrados.</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default Vehicles
