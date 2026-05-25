import { useState, useEffect } from 'react'
import { getWebsiteSection, updateWebsiteSection } from '../services/api'

function Settings() {
  const [settings, setSettings] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    business_tagline: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  // Cargar datos existentes al montar componente
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await getWebsiteSection('settings')
      if (response.data) {
        setSettings({
          business_name: response.data.business_name?.value || 'FRAY RENT CAR',
          business_email: response.data.business_email?.value || 'operaciones@frayrentcar.com',
          business_phone: response.data.business_phone?.value || '',
          business_address: response.data.business_address?.value || '',
          business_tagline: response.data.business_tagline?.value || ''
        })
      }
      setMessage(null)
    } catch (error) {
      console.log('Cargando valores por defecto para settings')
      // Usar valores por defecto si no existen en BD
      setSettings({
        business_name: 'FRAY RENT CAR',
        business_email: 'operaciones@frayrentcar.com',
        business_phone: '',
        business_address: '',
        business_tagline: ''
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Preparar contenido en formato esperado por el backend
      const contents = {}
      Object.keys(settings).forEach(key => {
        contents[key] = {
          value: settings[key],
          type: 'text',
          is_active: true
        }
      })
      
      await updateWebsiteSection('settings', contents)
      
      setMessage({
        type: 'success',
        text: '✅ Configuración guardada exitosamente'
      })
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error al guardar settings:', error)
      setMessage({
        type: 'error',
        text: '❌ Error al guardar configuración: ' + (error.response?.data?.message || error.message)
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-luxuryText">Settings</h2>
          <p className="text-sm text-luxuryMuted">Configuración base del panel interno.</p>
        </div>
        <div className="panel-card p-5">
          <p className="text-luxuryMuted">Cargando configuración...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-luxuryText">Settings</h2>
        <p className="text-sm text-luxuryMuted">Configuración base del panel interno.</p>
      </div>

      {/* Mensaje de feedback */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900/20 text-green-200 border border-green-700/50' 
            : 'bg-red-900/20 text-red-200 border border-red-700/50'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="panel-card p-5">
          <h3 className="text-lg font-semibold text-luxuryText">Información del Negocio</h3>
          
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Nombre del negocio */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Nombre del negocio *</label>
              <input 
                type="text"
                name="business_name"
                value={settings.business_name}
                onChange={handleChange}
                required
                className="input-luxury" 
                placeholder="FRAY RENT CAR"
              />
            </div>

            {/* Email operativo */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Email operativo *</label>
              <input 
                type="email"
                name="business_email"
                value={settings.business_email}
                onChange={handleChange}
                required
                className="input-luxury"
                placeholder="operaciones@frayrentcar.com"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Teléfono principal</label>
              <input 
                type="tel"
                name="business_phone"
                value={settings.business_phone}
                onChange={handleChange}
                className="input-luxury"
                placeholder="+1 809 000 0000"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Dirección principal</label>
              <input 
                type="text"
                name="business_address"
                value={settings.business_address}
                onChange={handleChange}
                className="input-luxury"
                placeholder="Calle Principal, 123, Ciudad"
              />
            </div>

            {/* Tagline */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-luxuryMuted">Tagline / Subtítulo del negocio</label>
              <input 
                type="text"
                name="business_tagline"
                value={settings.business_tagline}
                onChange={handleChange}
                className="input-luxury"
                placeholder="Alquiler de vehículos premium"
              />
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-[#c9a227] to-[#d4af37] text-black font-semibold rounded-lg hover:from-[#d4af37] hover:to-[#c9a227] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={loadSettings}
            disabled={saving}
            className="px-6 py-2 border border-[#c9a227]/50 text-[#c9a227] font-semibold rounded-lg hover:bg-[#c9a227]/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↻ Cargar Originales
          </button>
        </div>
      </form>
    </section>
  )
}

export default Settings
