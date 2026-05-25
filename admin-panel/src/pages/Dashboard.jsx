import { useState, useEffect } from 'react'
import StatsCard from '../components/dashboard/StatsCard'
import { getDashboardMetrics } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState([
    { id: 1, title: 'Total Reservas', value: '—', subtitle: 'registradas', tone: 'neutral' },
    { id: 2, title: 'Vehículos Activos', value: '—', subtitle: 'en flota', tone: 'neutral' },
    { id: 3, title: 'Clientes', value: '—', subtitle: 'registrados', tone: 'neutral' },
    { id: 4, title: 'Ingresos Totales', value: '—', subtitle: 'completadas', tone: 'neutral' }
  ])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        const response = await getDashboardMetrics()
        const m = response.data
        setMetrics(m)

        // Actualizar estadísticas con datos reales
        setStats([
          {
            id: 1,
            title: 'Total Reservas',
            value: String(m.reservations?.total || 0),
            subtitle: `${m.reservations?.active || 0} activas, ${m.reservations?.pending || 0} pendientes`,
            tone: 'positive'
          },
          {
            id: 2,
            title: 'Vehículos Activos',
            value: String(m.vehicles?.active || 0),
            subtitle: `de ${m.vehicles?.total || 0} en total (${m.vehicles?.featured || 0} destacados)`,
            tone: m.vehicles?.active > 0 ? 'positive' : 'neutral'
          },
          {
            id: 3,
            title: 'Clientes',
            value: String(m.clients?.total || 0),
            subtitle: 'registrados',
            tone: 'neutral'
          },
          {
            id: 4,
            title: 'Ingresos Totales',
            value: `${(m.income?.total || 0).toFixed(0)}€`,
            subtitle: `${m.reservations?.completed || 0} completadas`,
            tone: m.income?.total > 0 ? 'positive' : 'neutral'
          }
        ])

        // Actividad reciente
        const activity = (m.recentReservations || []).map(r => {
          return `Reserva #${r.id}: ${r.client} - ${r.vehicle} (${r.status})`
        })
        setRecentActivity(activity.length > 0 ? activity : ['No hay actividad reciente'])
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setRecentActivity(['Error al cargar datos'])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <section className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-luxuryText">Dashboard</h2>
        <p className="text-xs sm:text-sm text-luxuryMuted">
          Bienvenido, {user?.name || user?.email}. Resumen general de la operación.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="panel-card p-5">
              <div className="h-4 w-20 animate-pulse rounded bg-luxuryGold/20"></div>
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-luxuryGold/20"></div>
              <div className="mt-1 h-3 w-24 animate-pulse rounded bg-luxuryGold/20"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatsCard
              key={item.id}
              title={item.title}
              value={item.value}
              subtitle={item.subtitle}
              tone={item.tone}
            />
          ))}
        </div>
      )}

      <div className="panel-card p-5">
        <h3 className="text-lg font-semibold text-luxuryText">Actividad reciente</h3>
        <ul className="mt-3 space-y-2 text-sm text-luxuryMuted">
          {recentActivity.map((entry, index) => (
            <li key={index} className="rounded-lg border border-luxuryGold/10 bg-luxuryPanel px-3 py-2">
              {entry}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Dashboard
