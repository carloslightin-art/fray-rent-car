export const summaryStats = [
  {
    id: 1,
    title: 'Reservas pendientes',
    value: 18,
    subtitle: 'Por confirmar hoy',
    tone: 'warning'
  },
  {
    id: 2,
    title: 'Reservas confirmadas',
    value: 46,
    subtitle: 'Últimos 7 días',
    tone: 'success'
  },
  {
    id: 3,
    title: 'Reservas canceladas',
    value: 5,
    subtitle: 'Últimos 30 días',
    tone: 'danger'
  },
  {
    id: 4,
    title: 'Coches disponibles',
    value: 27,
    subtitle: 'Listos para asignar',
    tone: 'gold'
  }
]

export const recentActivity = [
  'Reserva #A102 confirmada por Ana Ruiz',
  'Nuevo cliente corporativo registrado',
  'Vehículo Mercedes S-Class marcado en mantenimiento',
  'Reserva #A099 cancelada por cliente'
]

export const reservationRows = [
  {
    id: 1,
    client: 'Carlos Méndez',
    vehicle: 'Mercedes S-Class',
    pickup: '2026-03-21',
    dropoff: '2026-03-24',
    status: 'pending',
    worker: 'Lucía'
  },
  {
    id: 2,
    client: 'Laura Gómez',
    vehicle: 'Range Rover Sport',
    pickup: '2026-03-22',
    dropoff: '2026-03-26',
    status: 'confirmed',
    worker: 'Miguel'
  },
  {
    id: 3,
    client: 'Daniel Ortega',
    vehicle: 'Porsche 911',
    pickup: '2026-03-25',
    dropoff: '2026-03-27',
    status: 'cancelled',
    worker: 'Lucía'
  }
]
