import { Calendar, MapPin, Car, Shield, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const locations = ['Santo Domingo Centro', 'Aeropuerto Las Américas (SDQ)', 'Punta Cana / Aeropuerto PUJ']
const categories = [
  { value: 'economico', label: 'Económico' },
  { value: 'ejecutivo', label: 'Ejecutivo' },
  { value: 'lujo', label: 'Lujo' },
  { value: 'deportivo', label: 'Deportivo' }
]

function FieldShell({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#d4af37]">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      {children}
    </label>
  )
}

function BookingForm({ onSubmit, formData: externalFormData, onChange, loading, error }) {
  const navigate = useNavigate()
  const isFullForm = !!externalFormData

  const [internalFormData, setInternalFormData] = useState({
    pickup_date: '',
    return_date: '',
    pickup_location: '',
    drop_location: '',
    category: ''
  })

  const formData = isFullForm ? externalFormData : internalFormData

  const baseInput = 'w-full rounded-2xl border border-[#d4af37]/22 bg-[#090909]/90 px-4 py-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 hover:border-[#d4af37]/45 focus:border-[#d4af37] focus:bg-[#101010] focus:shadow-[0_0_0_4px_rgba(212,175,55,0.08)]'
  const iconInput = `${baseInput} pl-11`

  const handleChange = (e) => {
    if (isFullForm) {
      onChange(e)
      return
    }
    setInternalFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isFullForm) {
      onSubmit(e)
      return
    }

    const params = new URLSearchParams()
    Object.entries(formData).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    navigate(`/booking?${params.toString()}`)
  }

  if (isFullForm) {
    return (
      <section className="relative px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#d4af37]/20 bg-[#070707] shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
          <div className="grid lg:grid-cols-[0.74fr_1.26fr]">
            <aside className="relative overflow-hidden border-b border-[#d4af37]/15 bg-[#0b0b0b] p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.18),transparent_36%)]" />
              <div className="relative">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#d4af37]">Reserva premium</p>
                <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">Confirma tu experiencia</h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400">Completa los datos para enviar la reserva. El equipo podrá confirmar disponibilidad, precio final y entrega.</p>
                <div className="mt-8 space-y-4">
                  {[
                    [Shield, 'Seguro incluido'],
                    [Clock, 'Confirmación rápida'],
                    [Car, 'Flota seleccionada']
                  ].map(([Icon, text]) => (
                    <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm font-semibold text-zinc-200">
                      <Icon className="h-5 w-5 text-[#d4af37]" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <form onSubmit={handleSubmit} className="space-y-7 p-5 sm:p-8">
              {error && (
                <div className="flex gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-black text-white">Datos del conductor</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <FieldShell label="Nombre completo">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={baseInput} placeholder="Juan Pérez" required />
                  </FieldShell>
                  <FieldShell label="Email">
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={baseInput} placeholder="tu@email.com" required />
                  </FieldShell>
                  <FieldShell label="Teléfono">
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={baseInput} placeholder="+1 809 000 0000" required />
                  </FieldShell>
                  <FieldShell label="Licencia">
                    <input type="text" name="license_number" value={formData.license_number} onChange={handleChange} className={baseInput} placeholder="12345678X" required />
                  </FieldShell>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Detalles de la reserva</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <FieldShell label="Recogida" icon={Calendar}>
                    <input type="date" name="pickup_date" value={formData.pickup_date} onChange={handleChange} className={baseInput} required />
                  </FieldShell>
                  <FieldShell label="Devolución" icon={Calendar}>
                    <input type="date" name="return_date" value={formData.return_date} onChange={handleChange} className={baseInput} required />
                  </FieldShell>
                  <FieldShell label="Recoger en" icon={MapPin}>
                    <select name="pickup_location" value={formData.pickup_location} onChange={handleChange} className={baseInput} required>
                      <option value="">Selecciona ubicación</option>
                      {locations.map((location) => <option key={location} value={location}>{location}</option>)}
                    </select>
                  </FieldShell>
                  <FieldShell label="Devolver en" icon={MapPin}>
                    <select name="drop_location" value={formData.drop_location} onChange={handleChange} className={baseInput} required>
                      <option value="">Selecciona ubicación</option>
                      {locations.map((location) => <option key={location} value={location}>{location}</option>)}
                    </select>
                  </FieldShell>
                  <div className="md:col-span-2">
                    <FieldShell label="Categoría" icon={Car}>
                      <select name="category" value={formData.category} onChange={handleChange} className={baseInput} required>
                        <option value="">Selecciona categoría</option>
                        {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                      </select>
                    </FieldShell>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gold-gradient px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-black shadow-[0_18px_45px_rgba(212,175,55,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Procesando reserva...' : 'Confirmar reserva'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative z-30 -mt-10 px-4 pb-10 sm:-mt-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#d4af37]/25 bg-[#050505]/92 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.55),0_0_60px_rgba(212,175,55,0.08)] backdrop-blur-xl sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37]">Reserva inteligente</p>
            <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">Encuentra tu vehículo perfecto</h3>
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-400">Selecciona fechas, ubicación y categoría. En móvil todo queda en una columna limpia y fácil de tocar.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.05fr_1.05fr_1fr_auto]">
          <FieldShell label="Recogida" icon={Calendar}>
            <input type="date" name="pickup_date" value={formData.pickup_date} onChange={handleChange} className={iconInput} required />
          </FieldShell>
          <FieldShell label="Devolución" icon={Calendar}>
            <input type="date" name="return_date" value={formData.return_date} onChange={handleChange} className={iconInput} required />
          </FieldShell>
          <FieldShell label="Recoger en" icon={MapPin}>
            <select name="pickup_location" value={formData.pickup_location} onChange={handleChange} className={iconInput} required>
              <option value="">Ubicación</option>
              {locations.map((location) => <option key={location} value={location}>{location}</option>)}
            </select>
          </FieldShell>
          <FieldShell label="Devolver en" icon={MapPin}>
            <select name="drop_location" value={formData.drop_location} onChange={handleChange} className={iconInput} required>
              <option value="">Ubicación</option>
              {locations.map((location) => <option key={location} value={location}>{location}</option>)}
            </select>
          </FieldShell>
          <FieldShell label="Categoría" icon={Car}>
            <select name="category" value={formData.category} onChange={handleChange} className={iconInput} required>
              <option value="">Categoría</option>
              {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
            </select>
          </FieldShell>
          <button type="submit" className="mt-5 inline-flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-black shadow-[0_14px_35px_rgba(212,175,55,0.25)] transition hover:-translate-y-0.5 sm:col-span-2 xl:col-span-1 xl:mt-[29px]">
            Reservar
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  )
}

export default BookingForm
