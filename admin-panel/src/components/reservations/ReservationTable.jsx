const statusClass = {
  pending: 'bg-luxuryWarning/20 text-luxuryWarning',
  confirmed: 'bg-luxurySuccess/20 text-luxurySuccess',
  cancelled: 'bg-luxuryDanger/20 text-luxuryDanger',
  finished: 'bg-luxuryGold/20 text-luxuryGold'
}

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  finished: 'Finalizada'
}

// Matriz de permisos: qué transiciones permite cada rol
const rolePermissions = {
  owner: {
    pending: ['confirmed', 'cancelled'],  //Desde pendiente puede confirmar o cancelar
    confirmed: ['cancelled', 'finished'], //Desde confirmada puede cancelar o finalizar
    cancelled: [],                         //Desde cancelada no hay cambio
    finished: []                          //Desde finalizada no hay cambio
  },
  worker: {
    pending: ['confirmed'],               //Desde pendiente puede confirmar
    confirmed: ['finished'],              //Desde confirmada puede finalizar
    cancelled: [],
    finished: []
  }
}

function ReservationTable({ rows, onStatusChange, updatingId, userRole }) {
  const allowedTransitions = rolePermissions[userRole] || rolePermissions.worker

  // Obtener opciones válidas para el estado actual
  const getOptionsForStatus = (currentStatus) => {
    return allowedTransitions[currentStatus] || []
  }

  return (
    <div className="panel-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-luxuryPanel">
            <tr className="border-b border-luxuryGold/15 text-luxuryMuted">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Vehículo</th>
              <th className="px-4 py-3 font-medium">Fechas</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const options = getOptionsForStatus(item.status)
              const hasOptions = options.length > 0
              
              return (
                <tr key={item.id} className="border-b border-luxuryGold/10">
                  <td className="px-4 py-3 text-luxuryMuted">#{item.id}</td>
                  <td className="px-4 py-3 text-luxuryText">{item.client}</td>
                  <td className="px-4 py-3 text-luxuryText">{item.vehicle}</td>
                  <td className="px-4 py-3 text-luxuryMuted">
                    {item.pickup} → {item.dropoff}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass[item.status]}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      onChange={(e) => onStatusChange(item.id, e.target.value)}
                      disabled={updatingId === item.id || !hasOptions}
                      className={`input-luxury !py-1 !px-2 text-xs ${!hasOptions ? 'opacity-50' : ''}`}
                    >
                      <option value={item.status} disabled>
                        {statusLabels[item.status] || item.status}
                      </option>
                      {options.map(status => (
                        <option key={status} value={status}>
                          {statusLabels[status] || status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReservationTable
