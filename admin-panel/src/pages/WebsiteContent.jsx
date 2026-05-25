import { useState, useEffect } from 'react'
import { Save, Globe, Car, Shield, Phone, Mail, MapPin } from 'lucide-react'
import { getAllContent, getFeaturedVehicles, updateSectionContent, updateFeaturedVehicles } from '../services/websiteContent'
import { getVehicles } from '../services/api'

import { useAuth } from '../context/AuthContext'

function WebsiteContent() {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [content, setContent] = useState({})
  const [vehicles, setVehicles] = useState([])
  const [featuredVehicles, setFeaturedVehicles] = useState([])

  // Cargar contenido inicial
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [contentRes, vehiclesRes, featuredRes] = await Promise.all([
        getAllContent(),
        getVehicles(),
        getFeaturedVehicles()
      ])
      
      setContent(contentRes.data)
      setVehicles(vehiclesRes.data)
      setFeaturedVehicles(featuredRes.data.map(v => v.id))
    } catch (error) {
      console.error('Error cargando contenido:', error)
      setMessage({ type: 'error', text: 'Error al cargar contenido' })
    } finally {
      setLoading(false)
    }
  }

  // Actualizar campo
  const updateField = (section, key, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: {
          ...prev[section]?.[key],
          value
        }
      }
    }))
  }

  // Guardar sección
  const saveSection = async (sectionName, sectionData) => {
    try {
      setSaving(true)
      const formattedData = {}

      if (!sectionData || typeof sectionData !== 'object') {
        setMessage({ type: 'error', text: `No hay datos para guardar en ${sectionName}` })
        setSaving(false)
        return
      }

      for (const [key, data] of Object.entries(sectionData)) {
        const value = data?.value
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          formattedData[key] = { value: String(value) }
        }
      }

      if (Object.keys(formattedData).length === 0) {
        setMessage({ type: 'error', text: 'No hay campos con valor para guardar' })
        setSaving(false)
        return
      }

      await updateSectionContent({
        section: sectionName,
        contents: formattedData
      })

      setMessage({ type: 'success', text: `${sectionName} guardado correctamente` })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error guardando sección:', error)
      setMessage({ type: 'error', text: 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  // Guardar vehículos destacados
  const saveFeaturedVehicles = async () => {
    try {
      setSaving(true)
      await updateFeaturedVehicles(featuredVehicles)
      setMessage({ type: 'success', text: 'Vehículos destacados guardados' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar vehículos' })
    } finally {
      setSaving(false)
    }
  }

  // Toggle vehículo destacado
  const toggleFeaturedVehicle = (vehicleId) => {
    setFeaturedVehicles(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId)
      }
      if (prev.length >= 3) {
        setMessage({ type: 'warning', text: 'Máximo 3 vehículos destacados' })
        setTimeout(() => setMessage(null), 3000)
        return prev
      }
      return [...prev, vehicleId]
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Contenido Web</h1>
          <p className="text-gray-400 mt-1">Gestiona el contenido visible en la web pública</p>
        </div>
        {message && (
          <div className={`px-4 py-2 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' :
            message.type === 'error' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* SECCIÓN: HOME */}
      <section className="bg-[#111] rounded-xl p-6 mb-6 border border-[#222]">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-white">Home - Información General</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nombre de Empresa</label>
            <input
              type="text"
              value={content.home?.company_name?.value || ''}
              onChange={(e) => updateField('home', 'company_name', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Subtítulo Principal</label>
            <input
              type="text"
              value={content.home?.company_subtitle?.value || ''}
              onChange={(e) => updateField('home', 'company_subtitle', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Título Flota</label>
            <input
              type="text"
              value={content.home?.fleet_title?.value || ''}
              onChange={(e) => updateField('home', 'fleet_title', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Título Confianza</label>
            <input
              type="text"
              value={content.home?.trust_title?.value || ''}
              onChange={(e) => updateField('home', 'trust_title', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
        </div>
        
{isOwner ? (
          <button
            onClick={() => saveSection('home', content.home)}
            disabled={saving}
            className="mt-4 flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Home'}
          </button>
        ) : (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">Solo el owner puede editar el contenido web</p>
          </div>
        )}
      </section>

      {/* SECCIÓN: HERO */}
      <section className="bg-[#111] rounded-xl p-6 mb-6 border border-[#222]">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-white">Hero - Sección Principal</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Título Línea 1</label>
            <input
              type="text"
              value={content.hero?.title_line1?.value || ''}
              onChange={(e) => updateField('hero', 'title_line1', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Título Línea 2</label>
            <input
              type="text"
              value={content.hero?.title_line2?.value || ''}
              onChange={(e) => updateField('hero', 'title_line2', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Subtítulo</label>
            <input
              type="text"
              value={content.hero?.subtitle?.value || ''}
              onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Botón Principal</label>
            <input
              type="text"
              value={content.hero?.button_primary?.value || ''}
              onChange={(e) => updateField('hero', 'button_primary', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Botón Secundario</label>
            <input
              type="text"
              value={content.hero?.button_secondary?.value || ''}
              onChange={(e) => updateField('hero', 'button_secondary', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tarjeta: Estado</label>
            <input
              type="text"
              value={content.hero?.availability_badge?.value || ''}
              onChange={(e) => updateField('hero', 'availability_badge', e.target.value)}
              placeholder="Disponible ahora"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tarjeta: Título</label>
            <input
              type="text"
              value={content.hero?.availability_title?.value || ''}
              onChange={(e) => updateField('hero', 'availability_title', e.target.value)}
              placeholder="Flota premium"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tarjeta: Disponibilidad/Horario</label>
            <input
              type="text"
              value={content.hero?.availability_schedule?.value || ''}
              onChange={(e) => updateField('hero', 'availability_schedule', e.target.value)}
              placeholder="Entrega programada"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tarjeta: Zona / Ubicación</label>
            <input
              type="text"
              value={content.hero?.availability_location?.value || ''}
              onChange={(e) => updateField('hero', 'availability_location', e.target.value)}
              placeholder="República Dominicana / Aeropuerto"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
        </div>

        {isOwner ? (
          <button
            onClick={() => saveSection('hero', content.hero)}
            disabled={saving}
            className="mt-4 flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Hero'}
          </button>
        ) : (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">Solo el owner puede editar el contenido web</p>
          </div>
        )}
      </section>

      {/* SECCIÓN: BOOKING */}
      <section className="bg-[#111] rounded-xl p-6 mb-6 border border-[#222]">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-white">Booking - Formulario de Reserva</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Precio Desde (€)</label>
            <input
              type="number"
              value={content.booking?.price_from?.value || ''}
              onChange={(e) => updateField('booking', 'price_from', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Texto Botón</label>
            <input
              type="text"
              value={content.booking?.button_text?.value || ''}
              onChange={(e) => updateField('booking', 'button_text', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Label Recogida</label>
            <input
              type="text"
              value={content.booking?.label_pickup?.value || ''}
              onChange={(e) => updateField('booking', 'label_pickup', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Label Devolución</label>
            <input
              type="text"
              value={content.booking?.label_return?.value || ''}
              onChange={(e) => updateField('booking', 'label_return', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Label Desde</label>
            <input
              type="text"
              value={content.booking?.label_from?.value || ''}
              onChange={(e) => updateField('booking', 'label_from', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Label Hasta</label>
            <input
              type="text"
              value={content.booking?.label_to?.value || ''}
              onChange={(e) => updateField('booking', 'label_to', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
        </div>

        {isOwner ? (
          <button
            onClick={() => saveSection('booking', content.booking)}
            disabled={saving}
            className="mt-4 flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Booking'}
          </button>
        ) : (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">Solo el owner puede editar el contenido web</p>
          </div>
        )}
      </section>

      {/* SECCIÓN: FLEET - Vehículos Destacados */}
      <section className="bg-[#111] rounded-xl p-6 mb-6 border border-[#222]">
        <div className="flex items-center gap-3 mb-6">
          <Car className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-white">Flota Destacada</h2>
          <span className="text-sm text-gray-400">(máximo 3)</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(vehicle => (
            <div 
              key={vehicle.id}
              onClick={() => toggleFeaturedVehicle(vehicle.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                featuredVehicles.includes(vehicle.id)
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-[#333] bg-[#0a0a0a] hover:border-yellow-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{vehicle.brand} {vehicle.model}</h3>
                  <p className="text-yellow-500 font-bold">{vehicle.price_per_day}€/día</p>
                </div>
                {featuredVehicles.includes(vehicle.id) && (
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-black text-sm">✓</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {isOwner ? (
          <button
            onClick={saveFeaturedVehicles}
            disabled={saving}
            className="mt-4 flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Flota Destacada'}
          </button>
        ) : (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">Solo el owner puede editar el contenido web</p>
          </div>
        )}
      </section>

      {/* SECCIÓN: TRUST SERVICES */}
      <section className="bg-[#111] rounded-xl p-6 mb-6 border border-[#222]">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-white">Servicio de Confianza</h2>
        </div>
        
        <div className="space-y-6">
          {/* Item 1 */}
          <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#222]">
            <h3 className="text-white font-medium mb-4">Servicio 1</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Título</label>
                <input
                  type="text"
                  value={content.trust?.item1_title?.value || ''}
                  onChange={(e) => updateField('trust', 'item1_title', e.target.value)}
                  className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Descripción</label>
                <input
                  type="text"
                  value={content.trust?.item1_description?.value || ''}
                  onChange={(e) => updateField('trust', 'item1_description', e.target.value)}
                  className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Item 2 */}
          <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#222]">
            <h3 className="text-white font-medium mb-4">Servicio 2</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Título</label>
                <input
                  type="text"
                  value={content.trust?.item2_title?.value || ''}
                  onChange={(e) => updateField('trust', 'item2_title', e.target.value)}
                  className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Descripción</label>
                <input
                  type="text"
                  value={content.trust?.item2_description?.value || ''}
                  onChange={(e) => updateField('trust', 'item2_description', e.target.value)}
                  className="w-full bg-[#050505] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {isOwner ? (
          <button
            onClick={() => saveSection('trust', content.trust)}
            disabled={saving}
            className="mt-4 flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Servicios'}
          </button>
        ) : (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">Solo el owner puede editar el contenido web</p>
          </div>
        )}
      </section>

      {/* SECCIÓN: CONTACT */}
      <section className="bg-[#111] rounded-xl p-6 mb-6 border border-[#222]">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-white">Contact - Página de Contacto</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Título</label>
            <input
              type="text"
              value={content.contact?.title?.value || ''}
              onChange={(e) => updateField('contact', 'title', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              placeholder="Contacto"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Subtítulo</label>
            <input
              type="text"
              value={content.contact?.subtitle?.value || ''}
              onChange={(e) => updateField('contact', 'subtitle', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              placeholder="Nuestro equipo está disponible..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Teléfono</label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={content.contact?.phone?.value || ''}
                onChange={(e) => updateField('contact', 'phone', e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
                placeholder="+1 809 000 0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={content.contact?.email?.value || ''}
                onChange={(e) => updateField('contact', 'email', e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
                placeholder="info@frayrentcar.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Dirección</label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={content.contact?.address?.value || ''}
                onChange={(e) => updateField('contact', 'address', e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
                placeholder="Santo Domingo, República Dominicana"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Horario</label>
            <input
              type="text"
              value={content.contact?.hours?.value || ''}
              onChange={(e) => updateField('contact', 'hours', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              placeholder="Lun - Dom · 08:00 - 22:00"
            />
          </div>
        </div>

        {isOwner ? (
          <button
            onClick={() => saveSection('contact', content.contact)}
            disabled={saving}
            className="mt-4 flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Contact'}
          </button>
        ) : (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">Solo el owner puede editar el contenido web</p>
          </div>
        )}
      </section>

      {/* SECCIÓN: FOOTER */}
      <section className="bg-[#111] rounded-xl p-6 mb-6 border border-[#222]">
        <div className="flex items-center gap-3 mb-6">
          <Phone className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-white">Footer - Pie de Página</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Teléfono</label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={content.footer?.phone?.value || ''}
                onChange={(e) => updateField('footer', 'phone', e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={content.footer?.email?.value || ''}
                onChange={(e) => updateField('footer', 'email', e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Dirección</label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={content.footer?.address?.value || ''}
                onChange={(e) => updateField('footer', 'address', e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Texto Legal</label>
            <input
              type="text"
              value={content.footer?.copyright?.value || ''}
              onChange={(e) => updateField('footer', 'copyright', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
        </div>

        {isOwner ? (
          <button
            onClick={() => saveSection('footer', content.footer)}
            disabled={saving}
            className="mt-4 flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Footer'}
          </button>
        ) : (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">Solo el owner puede editar el contenido web</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default WebsiteContent
