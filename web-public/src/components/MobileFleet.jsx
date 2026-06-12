import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, CarFront, Home, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { getFallbackVehicleImageUrl, getVehicleGalleryUrls } from '../utils/imageUtils'

const navItems = [
  { label: 'Inicio', icon: Home, to: '/' },
  { label: 'Reservas', icon: CalendarCheck, to: '/booking' },
  { label: 'Coches', icon: CarFront, to: '/fleet' },
  { label: 'Perfil', icon: UserRound, to: '/contact' }
]

const formatVehicleName = (name = 'Flota premium') =>
  name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase())

const formatPrice = (price = 50) => {
  const value = Number(price)
  if (!Number.isFinite(value)) return '50'
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '')
}


function MobileVehicleCard({ vehicle, index }) {
  const vehicleName = formatVehicleName(vehicle.name)
  const vehiclePrice = formatPrice(vehicle.price_per_day)
  const vehicleGallery = getVehicleGalleryUrls(vehicle).slice(0, 3)
  const [selectedImage, setSelectedImage] = useState(vehicleGallery[0] || '')

  useEffect(() => {
    setSelectedImage(vehicleGallery[0] || '')
  }, [vehicle.id, vehicleGallery[0]])

  return (
    <article
      key={`${vehicle.id}-${index}`}
      className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-white/[0.055] shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
    >
      <Link to={`/booking?vehicle=${vehicle.id}`} className="block">
        <div className="relative h-[190px] overflow-hidden bg-black">
          <img
            src={selectedImage || vehicleGallery[0] || getFallbackVehicleImageUrl(vehicle.id)}
            alt={vehicleName}
            className="h-full w-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.src = getFallbackVehicleImageUrl(vehicle.id)
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-transparent to-black/8" />
          <div className="absolute left-3 top-3 rounded-full border border-[#d4af37]/30 bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#d4af37] backdrop-blur-md">
            {vehicleGallery.length} {vehicleGallery.length === 1 ? 'foto' : 'fotos'}
          </div>
          <div className="absolute right-3 top-3 rounded-2xl bg-[#d4af37] px-3 py-2 text-right text-black shadow-[0_12px_35px_rgba(212,175,55,0.28)]">
            <p className="text-[9px] font-black uppercase leading-none">Desde</p>
            <p className="mt-1 text-base font-black leading-none">${vehiclePrice}/d</p>
          </div>
        </div>
      </Link>

      <div className="grid gap-3 p-4">
        {vehicleGallery.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {vehicleGallery.map((url, photoIndex) => (
              <button
                key={`${url}-${photoIndex}`}
                type="button"
                onClick={() => setSelectedImage(url)}
                aria-label={`Ver foto ${photoIndex + 1} de ${vehicleName}`}
                className={`h-14 overflow-hidden rounded-xl border bg-black transition active:scale-[0.98] ${selectedImage === url ? 'border-[#d4af37] ring-2 ring-[#d4af37]/55' : 'border-white/10'}`}
              >
                <img
                  src={url}
                  alt={`${vehicleName} foto ${photoIndex + 1}`}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = getFallbackVehicleImageUrl(vehicle.id + photoIndex)
                  }}
                />
              </button>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-xl font-black text-white">{vehicleName}</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-zinc-300">
            <span className="rounded-xl bg-black/35 px-2 py-2 text-center">{vehicle.seats || 5} plazas</span>
            <span className="rounded-xl bg-black/35 px-2 py-2 text-center">{vehicle.vehicle_type || 'Auto'}</span>
            <span className="rounded-xl bg-black/35 px-2 py-2 text-center">{vehicle.insurance_included === false ? 'Seguro opc.' : 'Seguro'}</span>
          </div>
          <p className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-[#d4af37]" /> Confirmación rápida
          </p>
        </div>

        <Link
          to={`/booking?vehicle=${vehicle.id}`}
          className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-[#d4af37] px-4 text-xs font-black uppercase tracking-[0.18em] text-black active:scale-[0.98]"
        >
          Reservar este coche
        </Link>
      </div>
    </article>
  )
}

function MobileFleet({ vehicles = [], loading = false }) {
  const visibleVehicles = vehicles.length ? vehicles : []

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030303] pb-[calc(12rem+env(safe-area-inset-bottom))] text-white md:hidden">
      <section className="relative overflow-hidden px-5 pt-[calc(6.5rem+env(safe-area-inset-top))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_7%,rgba(212,175,55,0.18),transparent_36%),linear-gradient(180deg,#070604_0%,#030303_72%)]" />
        <div className="relative z-10 mx-auto max-w-[430px]">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d4af37]">Nuestra flota</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">Elige tu coche</h1>
              <p className="mt-2 max-w-[290px] text-[13px] leading-6 text-zinc-400">
                Todos los vehículos disponibles para reservar. Puedes seguir bajando sin que la barra tape el último coche.
              </p>
            </div>
            <div className="mb-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-white/[0.055] px-3 py-2 text-[10px] font-bold text-zinc-300">
              <MapPin className="h-3.5 w-3.5 text-[#d4af37]" /> RD
            </div>
          </div>

          {loading && visibleVehicles.length === 0 ? (
            <div className="grid min-h-[45vh] place-items-center">
              <div className="h-11 w-11 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-5 pb-10">
              {loading && visibleVehicles.length > 0 && (
                <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#d4af37]">
                  Actualizando disponibilidad...
                </div>
              )}
              {visibleVehicles.map((vehicle, index) => (
                <MobileVehicleCard key={`${vehicle.id}-${index}`} vehicle={vehicle} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <nav className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[398px] items-center justify-between rounded-[1.7rem] border border-[#d4af37]/18 bg-black/82 px-2 py-2 shadow-[0_18px_65px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        {navItems.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-[1.25rem] px-2 py-2 text-[10px] font-black uppercase tracking-[0.08em] ${
              to === '/fleet' ? 'bg-[#d4af37] text-black' : 'text-zinc-400'
            }`}
          >
            <Icon className="mb-1 h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </main>
  )
}

export default MobileFleet
