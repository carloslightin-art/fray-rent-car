import { useState, useEffect } from 'react'
import ReservationTable from '../components/reservations/ReservationTable'
import { getReservations, updateReservationStatus } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Matriz de permisos: qué transiciones permite cada rol
const rolePermissions = {
  owner: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['cancelled', 'finished'],
    cancelled: [],
    finished: []
  },
  worker: {
    pending: ['confirmed'],
    confirmed: ['finished'],
    cancelled: [],
    finished: []
  }
}

// Validación frontend de permisos
const canTransition = (role, currentStatus, newStatus) => {
  const allowed = rolePermissions[role] || rolePermissions.worker
  return allowed[currentStatus]?.includes(newStatus) || false
}

function Reservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const userRole = user?.role || 'worker'

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await getReservations()
      // Transformar datos del API al formato esperado por el componente
      const formattedRows = response.data.map(r => ({
        id: r.id,
        client: r.client?.name || `Cliente #${r.client_id}`,
        vehicle: r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : `Vehículo #${r.vehicle_id}`,
        pickup: r.start_date,
        dropoff: r.end_date,
        status: r.status,
        worker: user?.name || '-'
      }))
      setReservations(formattedRows)
      setError(null)
    } catch (err) {
      console.error('Error fetching reservations:', err)
      setError('Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [user])

  const handleStatusChange = async (id, newStatus) => {
    const reservation = reservations.find(r => r.id === id)
    if (!reservation) return

    // Validación frontend: verificar permiso
    if (!canTransition(userRole, reservation.status, newStatus)) {
      alert(`No tienes permiso para cambiar de "${reservation.status}" a "${newStatus}"`)
      return
    }

    try {
      setUpdatingId(id)
      await updateReservationStatus(id, newStatus)
      // Actualizar localmente
      setReservations(prev => prev.map(r => 
        r.id === id ? { ...r, status: newStatus } : r
      ))
    } catch (err) {
      console.error('Error updating status:', err)
      const msg = err.response?.data?.message || 'Error al actualizar el estado'
      alert(msg)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-luxuryText">Reservas</h2>
          <p className="text-sm text-luxuryMuted">Gestión de reservas y estados operativos.</p>
        </div>
        <button 
          onClick={fetchReservations}
          disabled={loading}
          className="ghost-btn text-sm"
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-luxuryDanger/30 bg-luxuryDanger/10 p-4">
          <p className="text-luxuryDanger">{error}</p>
          <button onClick={fetchReservations} className="gold-btn mt-2 text-sm">
            Reintentar
          </button>
        </div>
      )}

      {loading && !error ? (
        <div className="panel-card p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-luxuryGold border-t-transparent"></div>
          <p className="mt-4 text-luxuryMuted">Cargando reservas...</p>
        </div>
      ) : (
        <>
          <ReservationTable 
            rows={reservations} 
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
            userRole={userRole}
          />
          
          {reservations.length === 0 && !error && (
            <div className="panel-card p-8 text-center">
              <p className="text-luxuryMuted">No hay reservas registradas.</p>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default Reservations
