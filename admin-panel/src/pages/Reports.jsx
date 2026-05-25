import { useState, useEffect } from 'react'
import { getReservationsReport, getClientsReport, getVehiclesReport } from '../services/api'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FileText, Download, Calendar, Filter, Car, Users, CalendarCheck } from 'lucide-react'

// Función para exportar a PDF
const exportToPDF = async (reportType, filters = {}) => {
  try {
    const params = {}

    if (reportType === 'reservations') {
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.status) params.status = filters.status
    } else if (reportType === 'vehicles') {
      if (filters.category) params.category = filters.category
      if (filters.isActive) params.isActive = filters.isActive
    }

    const response = await api.get(`/dashboard/reports/${reportType}/pdf`, {
      params,
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error exportando PDF:', err)
    alert('Error al descargar PDF')
  }
}

// Función para exportar a CSV
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Escapar comas y comillas
        const escaped = String(value || '').replace(/"/g, '""')
        return `"${escaped}"`
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

function Reports() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('reservations')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    category: '',
    isActive: ''
  })

  const isOwner = user?.role === 'owner'

  const fetchData = async () => {
    setLoading(true)
    try {
      let response
      switch (activeTab) {
        case 'reservations':
          response = await getReservationsReport({
            startDate: filters.startDate,
            endDate: filters.endDate,
            status: filters.status
          })
          break
        case 'clients':
          response = await getClientsReport()
          break
        case 'vehicles':
          response = await getVehiclesReport({
            category: filters.category,
            isActive: filters.isActive
          })
          break
        default:
          response = await getReservationsReport()
      }
      setData(response.data)
    } catch (err) {
      console.error('Error fetching report:', err)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const handleExport = () => {
    const filename = `reporte_${activeTab}`
    exportToCSV(data, filename)
  }

  const tabs = [
    { id: 'reservations', label: 'Reservas', icon: CalendarCheck },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'vehicles', label: 'Vehículos', icon: Car }
  ]

  const renderFilters = () => {
    if (activeTab === 'reservations') {
      return (
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
            className="input-luxury text-sm"
            placeholder="Fecha inicio"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
            className="input-luxury text-sm"
            placeholder="Fecha fin"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            className="input-luxury text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="finished">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      )
    }

    if (activeTab === 'vehicles') {
      return (
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
            className="input-luxury text-sm"
          >
            <option value="">Todas las categorías</option>
            <option value="economico">Económico</option>
            <option value="suv">SUV</option>
            <option value="premium">Premium</option>
            <option value="luxury">Lujo</option>
          </select>
          <select
            value={filters.isActive}
            onChange={(e) => setFilters(f => ({ ...f, isActive: e.target.value }))}
            className="input-luxury text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      )
    }

    return null
  }

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-luxuryGold border-t-transparent"></div>
          <p className="mt-4 text-luxuryMuted">Cargando datos...</p>
        </div>
      )
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto text-luxuryMuted opacity-30" />
          <p className="mt-4 text-luxuryMuted">No hay datos para mostrar</p>
        </div>
      )
    }

    const headers = Object.keys(data[0] || {})

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-luxuryGold/20">
              {headers.map(header => (
                <th key={header} className="px-3 py-2 text-left text-xs font-medium text-luxuryMuted uppercase">
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-luxuryGold/10">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-luxuryPanel/50">
                {headers.map(header => (
                  <td key={header} className="px-3 py-2 text-sm text-luxuryText">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-luxuryText">Reportes</h2>
          <p className="text-sm text-luxuryMuted">Consulta y exporta datos del sistema.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportToPDF(activeTab, filters)}
            disabled={!data || data.length === 0}
            className="gold-btn text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          <button
            onClick={handleExport}
            disabled={!data || data.length === 0}
            className="ghost-btn text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-luxuryGold/20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? 'border-luxuryGold text-luxuryGold'
                : 'border-transparent text-luxuryMuted hover:text-luxuryText'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      {renderFilters()}
      <button onClick={fetchData} className="ghost-btn text-sm mb-4">
        <Filter className="w-4 h-4 mr-2 inline" />
        Aplicar filtros
      </button>

      {/* Tabla */}
      <div className="panel-card">
        {renderTable()}
      </div>

      {/* Resumen */}
      {data && data.length > 0 && (
        <div className="text-sm text-luxuryMuted">
          Total de registros: <span className="text-luxuryGold font-medium">{data.length}</span>
        </div>
      )}
    </section>
  )
}

export default Reports
