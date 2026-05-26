import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWebsiteSection } from '../services/websiteContent'
import { ArrowRight, ShieldCheck, Clock3, MapPin } from 'lucide-react'

function Hero() {
  const [heroContent, setHeroContent] = useState({
    titleLine1: 'FRAY',
    titleLine2: 'RENT CAR',
    subtitle: 'Alquiler premium con entrega rápida, reserva online y asistencia personalizada en República Dominicana.',
    buttonPrimary: 'Reservar coche',
    buttonSecondary: 'Ver flota',
    availabilityBadge: 'Disponible ahora',
    availabilityTitle: 'Flota premium',
    availabilitySchedule: 'Entrega programada',
    availabilityLocation: 'República Dominicana / Aeropuerto'
  })

  useEffect(() => {
    const loadHeroContent = async () => {
      try {
        const response = await getWebsiteSection('hero')
        if (response.data) {
          setHeroContent({
            titleLine1: response.data.title_line1?.value || 'FRAY',
            titleLine2: response.data.title_line2?.value || 'RENT CAR',
            subtitle: response.data.subtitle?.value || 'Alquiler premium con entrega rápida, reserva online y asistencia personalizada en República Dominicana.',
            buttonPrimary: response.data.button_primary?.value || 'Reservar coche',
            buttonSecondary: response.data.button_secondary?.value || 'Ver flota',
            availabilityBadge: response.data.availability_badge?.value || 'Disponible ahora',
            availabilityTitle: response.data.availability_title?.value || 'Flota premium',
            availabilitySchedule: response.data.availability_schedule?.value || 'Entrega programada',
            availabilityLocation: response.data.availability_location?.value || 'República Dominicana / Aeropuerto'
          })
        }
      } catch (_error) {
        // Mantener contenido por defecto si la API de contenido no está disponible.
      }
    }
    loadHeroContent()
  }, [])

  return (
    <section className="relative min-h-[860px] overflow-hidden bg-[#030303] pt-[98px] sm:min-h-[900px] sm:pt-[120px] lg:min-h-[840px] lg:pt-[138px]">
      <div className="absolute inset-0">
        <img
          src="/images/hero/hero-car.jpg"
          alt="Vehículo premium FRAY RENT CAR"
          className="h-full w-full object-cover object-[62%_center] opacity-80 sm:object-[68%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_42%,rgba(212,175,55,0.34),transparent_28%),linear-gradient(90deg,#030303_0%,rgba(3,3,3,0.95)_22%,rgba(3,3,3,0.68)_48%,rgba(3,3,3,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,3,3,0.3)_0%,rgba(3,3,3,0.08)_42%,#030303_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030303] to-transparent" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(860px-98px)] max-w-7xl items-center gap-10 px-4 py-12 sm:min-h-[calc(900px-120px)] sm:px-6 lg:min-h-[calc(840px-138px)] lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
        <div className="max-w-2xl pt-8 sm:pt-0">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#d4af37]/25 bg-black/45 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-[#d4af37] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37] shadow-[0_0_18px_rgba(212,175,55,0.95)]" />
            Experiencia premium de alquiler
          </div>

          <h1 className="max-w-[620px] text-[clamp(2.75rem,12vw,5.8rem)] font-black uppercase leading-[0.86] tracking-[-0.06em] text-white drop-shadow-2xl lg:text-[5.9rem]">
            {heroContent.titleLine1}
            <span className="mt-2 block bg-gradient-to-r from-[#f7dc86] via-[#d4af37] to-[#8c6a17] bg-clip-text text-transparent">
              {heroContent.titleLine2}
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-zinc-200 sm:text-lg lg:text-xl">
            {heroContent.subtitle}
          </p>

          <div className="mt-8 grid gap-3 sm:flex">
            <Link
              to="/booking"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gold-gradient px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-black shadow-[0_16px_45px_rgba(212,175,55,0.3)] transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(212,175,55,0.42)]"
            >
              {heroContent.buttonPrimary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/fleet"
              className="inline-flex items-center justify-center rounded-2xl border border-[#d4af37]/55 bg-black/35 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-[#f1d274] backdrop-blur-md transition hover:border-[#d4af37] hover:bg-[#d4af37]/10"
            >
              {heroContent.buttonSecondary}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-2 rounded-[1.4rem] border border-white/10 bg-black/38 p-2 backdrop-blur-xl sm:max-w-xl">
            {[
              ['24/7', 'Asistencia'],
              ['60s', 'Reserva'],
              ['100%', 'Seguro']
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-[#d4af37]/10 bg-white/[0.035] px-3 py-4 text-center">
                <p className="text-xl font-black text-[#d4af37] sm:text-2xl">{value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden h-full items-end justify-center lg:flex">
          <div className="absolute bottom-28 right-2 w-[360px] rounded-[2rem] border border-[#d4af37]/25 bg-black/45 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d4af37]">{heroContent.availabilityBadge}</p>
                <p className="mt-1 text-2xl font-black text-white">{heroContent.availabilityTitle}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#d4af37]/15 text-[#d4af37]">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-zinc-300">
              <div className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-[#d4af37]" />{heroContent.availabilitySchedule}</div>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#d4af37]" />{heroContent.availabilityLocation}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
