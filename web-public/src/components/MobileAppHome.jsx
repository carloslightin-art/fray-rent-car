import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  CarFront,
  Home,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound
} from 'lucide-react'
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

function MobileAppHome({ vehicles = [], footerData = {} }) {
  const featured = vehicles.slice(0, 3)
  const heroVehicle = featured[1] || featured[0]
  const heroName = formatVehicleName(heroVehicle?.name)
  const heroPrice = formatPrice(heroVehicle?.price_per_day)
  const heroGallery = getVehicleGalleryUrls(heroVehicle).slice(0, 3)
  const phone = footerData.phone || '+1 809 000 0000'

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030303] text-white md:hidden">
      <section className="relative min-h-screen overflow-x-hidden pb-[calc(9.2rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(212,175,55,0.18),transparent_33%),radial-gradient(circle_at_10%_70%,rgba(212,175,55,0.12),transparent_36%),linear-gradient(180deg,#050505_0%,#090704_44%,#030303_100%)]" />
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/[0.05] blur-2xl" />
        <div className="absolute inset-x-7 top-[21rem] h-40 rounded-full bg-[#d4af37]/[0.11] blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5">
          <header className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Buscar vehículo"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-[#d4af37] shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            >
              <Search className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center">
              <div className="grid h-[74px] w-[74px] place-items-center overflow-hidden rounded-full bg-black shadow-[0_0_0_1px_rgba(212,175,55,0.55),0_18px_55px_rgba(212,175,55,0.18)]">
                <img src="/images/logo/logo-circle-fill.jpg" alt="FRAY RENT CAR" className="h-full w-full object-cover object-center" />
              </div>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.32em] text-[#d4af37]">FRAY RD</p>
            </div>

            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              aria-label="Llamar a FRAY RENT CAR"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-[#d4af37] shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            >
              <Phone className="h-5 w-5" />
            </a>
          </header>

          <div className="mt-6 text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#d4af37]">
              <Sparkles className="h-3.5 w-3.5" />
              App premium RD
            </div>
            <h1 className="mx-auto max-w-[340px] text-[2.9rem] font-black uppercase leading-[0.88] tracking-[-0.08em] text-white drop-shadow-[0_14px_40px_rgba(0,0,0,0.8)]">
              FRAY
              <span className="block bg-gradient-to-r from-[#f6df8a] via-[#d4af37] to-[#9d7823] bg-clip-text text-transparent">RENT CAR</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[310px] text-[13px] font-medium leading-6 text-zinc-300">
              Reserva vehículos en República Dominicana con entrega rápida, asistencia directa y experiencia de lujo desde tu móvil.
            </p>
          </div>

          <div className="relative mt-5 flex flex-col pb-2">
            <div className="relative mx-auto w-full max-w-[370px]">
              <div className="absolute inset-x-3 bottom-2 h-20 rounded-full bg-black/80 blur-xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-[#d4af37]/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.015))] p-3 shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
                <div className="relative aspect-[1.45] overflow-hidden rounded-[1.55rem] bg-black">
                  <img
                    src={heroGallery[0] || getFallbackVehicleImageUrl(heroVehicle?.id)}
                    alt={heroName}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackVehicleImageUrl(heroVehicle?.id)
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-black/18" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d4af37]">Vehículo destacado</p>
                      <h2 className="mt-1 text-lg font-black text-white">{heroName}</h2>
                    </div>
                    <div className="rounded-2xl bg-[#d4af37] px-3 py-2 text-right text-black shadow-[0_12px_35px_rgba(212,175,55,0.28)]">
                      <p className="text-[10px] font-black uppercase">Desde</p>
                      <p className="text-lg font-black leading-none">${heroPrice}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {heroGallery.map((url, index) => (
                    <div key={`${url}-${index}`} className="h-14 overflow-hidden rounded-xl border border-white/10 bg-black">
                      <img
                        src={url}
                        alt={`${heroName} foto ${index + 1}`}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = getFallbackVehicleImageUrl((heroVehicle?.id || 1) + index)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                ['24/7', 'Asistencia'],
                ['60s', 'Reserva'],
                ['100%', 'Seguro']
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] px-2 py-3 text-center shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
                  <p className="text-lg font-black text-[#d4af37]">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
              <Link
                to={`/booking?vehicle_id=${heroVehicle?.id || ''}`}
                className="inline-flex min-h-[58px] items-center justify-center rounded-[1.35rem] bg-[#d4af37] px-5 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[0_18px_55px_rgba(212,175,55,0.32)] active:scale-[0.98]"
              >
                Reservar ahora
              </Link>
              <Link
                to="/fleet"
                aria-label="Ver flota"
                className="grid h-[58px] w-[58px] place-items-center rounded-[1.35rem] border border-[#d4af37]/30 bg-white/[0.06] text-[#d4af37]"
              >
                <CarFront className="h-6 w-6" />
              </Link>
            </div>

            <section className="mt-[7.25rem] pb-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37]">Nuestra flota</p>
                  <h2 className="mt-1 text-xl font-black text-white">Elige tu coche</h2>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.055] px-3 py-2 text-[10px] font-bold text-zinc-300">
                  <MapPin className="h-3.5 w-3.5 text-[#d4af37]" /> RD
                </div>
              </div>
              <div className="space-y-4">
                {featured.map((vehicle, index) => {
                  const vehicleName = formatVehicleName(vehicle.name)
                  const vehiclePrice = formatPrice(vehicle.price_per_day)
                  const vehicleGallery = getVehicleGalleryUrls(vehicle).slice(0, 3)
                  return (
                    <article
                      key={`${vehicle.id}-${index}`}
                      className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-white/[0.055] shadow-[0_18px_50px_rgba(0,0,0,0.3)]"
                    >
                      <Link to={`/booking?vehicle_id=${vehicle.id}`} className="block">
                        <div className="relative h-[168px] overflow-hidden bg-black">
                          <img
                            src={vehicleGallery[0] || getFallbackVehicleImageUrl(vehicle.id)}
                            alt={vehicleName}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              e.currentTarget.src = getFallbackVehicleImageUrl(vehicle.id)
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-transparent to-black/8" />
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
                              <div key={`${url}-${photoIndex}`} className="h-14 overflow-hidden rounded-xl border border-white/10 bg-black">
                                <img
                                  src={url}
                                  alt={`${vehicleName} foto ${photoIndex + 1}`}
                                  className="h-full w-full object-cover object-center"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = getFallbackVehicleImageUrl(vehicle.id + photoIndex)
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-black text-white">{vehicleName}</h3>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-zinc-300">
                            <span className="rounded-xl bg-black/35 px-2 py-2 text-center">{vehicle.seats || 5} plazas</span>
                            <span className="rounded-xl bg-black/35 px-2 py-2 text-center">{vehicle.vehicle_type || 'Auto'}</span>
                            <span className="rounded-xl bg-black/35 px-2 py-2 text-center">{vehicle.insurance_included === false ? 'Seguro opc.' : 'Seguro'}</span>
                          </div>
                          <p className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-zinc-400">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#d4af37]" /> Confirmación rápida
                          </p>
                        </div>
                        <Link
                          to={`/booking?vehicle_id=${vehicle.id}`}
                          className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-[#d4af37] px-4 text-xs font-black uppercase tracking-[0.18em] text-black active:scale-[0.98]"
                        >
                          Reservar este coche
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          </div>
        </div>

        <nav className="fixed inset-x-4 bottom-[calc(0.9rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[398px] items-center justify-between rounded-[1.7rem] border border-[#d4af37]/18 bg-black/82 px-2 py-2 shadow-[0_18px_65px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          {navItems.map(({ label, icon: Icon, to }, index) => (
            <Link
              key={label}
              to={to}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-[1.25rem] px-2 py-2 text-[10px] font-black uppercase tracking-[0.08em] ${
                index === 0 ? 'bg-[#d4af37] text-black' : 'text-zinc-400'
              }`}
            >
              <Icon className="mb-1 h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  )
}

export default MobileAppHome
