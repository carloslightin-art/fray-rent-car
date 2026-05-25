import { useState, useEffect } from 'react'
import { getClients, createClient, updateClient, deleteClient } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOwner = user?.role === 'owner'

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await getClients()
      setClients(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError('Error al cargar los clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData)
      } else {
        await createClient(formData)
      }
      await fetchClients()
      resetForm()
    } catch (err) {
      console.error('Error saving client:', err)
      alert(err.response?.data?.message || 'Error al guardar el cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      license_number: client.license_number
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return

    try {
      await deleteClient(id)
      await fetchClients()
    } catch (err) {
      console.error('Error deleting client:', err)
      alert(err.response?.data?.message || 'Error al eliminar el cliente')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', license_number: '' })
    setEditingClient(null)
    setShowForm(false)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-luxuryText">Clientes</h2>
          <p className="text-sm text-luxuryMuted">Gestión de clientes y sus datos de contacto.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchClients}
            disabled={loading}
            className="ghost-btn text-sm"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          {isOwner && (
            <button 
              onClick={() => setShowForm(true)}
              className="gold-btn text-sm"
            >
              Nuevo cliente
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-luxuryDanger/30 bg-luxuryDanger/10 p-4">
          <p className="text-luxuryDanger">{error}</p>
          <button onClick={fetchClients} className="gold-btn mt-2 text-sm">
            Reintentar
          </button>
        </div>
      )}

      {isOwner && showForm && (
        <form onSubmit={handleSubmit} className="panel-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-luxuryText">
              {editingClient ? 'Editar cliente' : 'Nuevo cliente'}
            </h3>
            <button 
              type="button" 
              onClick={resetForm}
              className="ghost-btn text-sm"
            >
              Cancelar
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Nombre *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-luxury"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Email *</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input-luxury"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Teléfono *</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-luxury"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-luxuryMuted">Nº Licencia *</label>
              <input
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                className="input-luxury"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="gold-btn text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : (editingClient ? 'Actualizar' : 'Crear cliente')}
            </button>
          </div>
        </form>
      )}

      {loading && !error ? (
        <div className="panel-card p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-luxuryGold border-t-transparent"></div>
          <p className="mt-4 text-luxuryMuted">Cargando clientes...</p>
        </div>
      ) : (
        <div className="panel-card overflow-hidden">
          {/* Indicador de modo lectura para workers */}
          {!isOwner && (
            <div className="border-b border-luxuryGold/15 bg-luxuryPanel px-4 py-2">
              <p className="text-xs text-luxuryMuted">📖 Modo visualización (Worker)</p>
            </div>
          )}
          <table className="min-w-full text-left text-sm">
            <thead className="bg-luxuryPanel">
              <tr className="border-b border-luxuryGold/15 text-luxuryMuted">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Licencia</th>
                {isOwner && <th className="px-4 py-3 font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-luxuryGold/10">
                  <td className="px-4 py-3 text-luxuryText">{client.name}</td>
                  <td className="px-4 py-3 text-luxuryMuted">{client.email}</td>
                  <td className="px-4 py-3 text-luxuryText">{client.phone}</td>
                  <td className="px-4 py-3 text-luxuryMuted">{client.license_number}</td>
                  {isOwner && (
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleEdit(client)}
                        className="ghost-btn mr-2 !px-3 !py-1.5 text-xs"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        className="ghost-btn !px-3 !py-1.5 text-xs text-luxuryDanger hover:text-luxuryDanger"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {clients.length === 0 && !error && (
            <div className="p-8 text-center">
              <p className="text-luxuryMuted">No hay clientes registrados.</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default Clients
