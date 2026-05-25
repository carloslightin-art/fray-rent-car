import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BookingForm from '../components/BookingForm'
import Footer from '../components/Footer'
import { createClient, createReservation, getVehicles } from '../services/api'
import { FaShieldAlt, FaRegClock, FaCarSide } from 'react-icons/fa'

function Booking() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    pickup_date: '',
    return_date: '',
    pickup_location: '',
    drop_location: '',
    category: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Pre-fill form with URL params (from Home BookingForm)
  useEffect(() => {
    const params = {
      pickup_date: searchParams.get('pickup_date') || '',
      return_date: searchParams.get('return_date') || '',
      pickup_location: searchParams.get('pickup_location') || '',
      drop_location: searchParams.get('drop_location') || '',
      category: searchParams.get('category') || ''
    }
    if (Object.values(params).some(v => v !== '')) {
      setFormData(prev => ({ ...prev, ...params }))
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const calculateDays = () => {
    if (!formData.pickup_date || !formData.return_date) return 1
    const start = new Date(formData.pickup_date)
    const end = new Date(formData.return_date)
    const diffTime = end - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!formData.pickup_date || !formData.return_date || new Date(formData.pickup_date) >= new Date(formData.return_date)) {
      setError('Por favor, selecciona fechas válidas (recogida antes de devolución)')
      setLoading(false)
      return
    }

    try {
      // Step 1: Crear cliente
      const clientResponse = await createClient({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        license_number: formData.license_number
      })

      const clientId = clientResponse.data.id

      // Step 2: Resolve vehicle — prefer URL param, then category match, then first active
      const urlVehicleId = searchParams.get('vehicle')
      let vehicleId

      if (urlVehicleId) {
        vehicleId = parseInt(urlVehicleId)
      } else if (formData.category) {
        const vehiclesResponse = await getVehicles()
        const matched = vehiclesResponse.data.find(
          v => v.category === formData.category && v.is_active !== false
        )
        vehicleId = matched?.id
        if (!vehicleId) {
          // Fallback to first active vehicle if category has no matches
          vehicleId = vehiclesResponse.data.find(v => v.is_active !== false)?.id
        }
      } else {
        const vehiclesResponse = await getVehicles()
        vehicleId = vehiclesResponse.data.find(v => v.is_active !== false)?.id
      }

      if (!vehicleId) {
        setError('No hay vehículos disponibles en este momento. Contacta con nosotros por teléfono.')
        setLoading(false)
        return
      }

      // Step 3: Get vehicle price for total calculation
      const vehiclesResponse = await getVehicles()
      const vehicle = vehiclesResponse.data.find(v => v.id === vehicleId)
      const vehiclePrice = vehicle?.price_per_day || 100
      const totalPrice = calculateDays() * vehiclePrice

      // Step 4: Crear reserva
      const reservationData = {
        client_id: clientId,
        vehicle_id: vehicleId,
        start_date: formData.pickup_date,
        end_date: formData.return_date,
        total_price: totalPrice,
        pickup_location: formData.pickup_location,
        drop_location: formData.drop_location
      }

      const reservationResponse = await createReservation(reservationData)

      setSuccess(`¡Reserva creada exitosamente! ID: ${reservationResponse.data.id}. Te contactaremos pronto.`)
      setFormData({
        name: '',
        email: '',
        phone: '',
        license_number: '',
        pickup_date: '',
        return_date: '',
        pickup_location: '',
        drop_location: '',
        category: ''
      })

    } catch (err) {
      console.error('Error booking:', err)
      const message = err.response?.data?.message || 'Error al procesar la reserva. Inténtalo de nuevo.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-luxuryBlack">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-8 pt-32 sm:px-6 sm:pt-36 lg:px-8 lg:pt-40">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#060606] to-luxuryBlack" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.1),transparent_50%)]" />
        
        <div className="relative section-wrap">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-luxuryGold/50" />
              <span className="text-luxuryGold text-[10px] sm:text-xs uppercase tracking-[0.3em] font-medium">Reserva Premium</span>
              <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-luxuryGold/50" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-luxuryText">
              Configura tu <span className="font-bold text-luxuryGold">Experiencia</span>
            </h1>
            <p className="text-luxuryMuted text-xs sm:text-sm mt-3 sm:mt-4 max-w-xl mx-auto px-4">
              Completa todos los datos para confirmar disponibilidad y recibir tu cotización inmediata.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm">
            <Link to="/" className="text-luxuryMuted hover:text-luxuryGold transition-colors">Inicio</Link>
            <span className="text-luxuryGold/50">/</span>
            <span className="text-luxuryGold">Reservar</span>
          </div>
        </div>
      </section>

      <BookingForm 
        onSubmit={handleSubmit}
        formData={formData}
        onChange={handleChange}
        loading={loading}
        error={error}
        success={success}
      />

      {success && (
        <div className="section-wrap py-12">
          <div className="max-w-2xl mx-auto bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-green-400 mb-4">¡Reserva Confirmada!</h3>
            <p className="text-green-300 mb-6">{success}</p>
            <div className="flex gap-4 justify-center">
              <Link to="/" className="btn-gold">Volver al inicio</Link>
               <button onClick={() => setSuccess('')} className="btn-outline">Nueva reserva</button>
            </div>
          </div>
        </div>
      )}

      <section className="section-wrap pb-12 sm:pb-16">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-luxuryGold/20 bg-[#0a0a0a] p-6 text-center hover:border-luxuryGold/40 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-luxuryGold/30 flex items-center justify-center">
              <FaShieldAlt className="text-luxuryGold text-xl" />
            </div>
            <h3 className="font-semibold text-luxuryText">Reserva Segura</h3>
            <p className="mt-2 text-sm text-luxuryMuted">Confirmaciones instantáneas y seguimiento completo.</p>
          </div>
          <div className="rounded-xl border border-luxuryGold/20 bg-[#0a0a0a] p-6 text-center hover:border-luxuryGold/40 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-luxuryGold/30 flex items-center justify-center">
              <FaRegClock className="text-luxuryGold text-xl" />
            </div>
            <h3 className="font-semibold text-luxuryText">Confirmación Inmediata</h3>
            <p className="mt-2 text-sm text-luxuryMuted">Respuesta en segundos con disponibilidad real.</p>
          </div>
          <div className="rounded-xl border border-luxuryGold/20 bg-[#0a0a0a] p-6 text-center hover:border-luxuryGold/40 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-luxuryGold/30 flex items-center justify-center">
              <FaCarSide className="text-luxuryGold text-xl" />
            </div>
            <h3 className="font-semibold text-luxuryText">Flota Exclusiva</h3>
            <p className="mt-2 text-sm text-luxuryMuted">Vehículos premium verificados y listos para ti.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Booking
