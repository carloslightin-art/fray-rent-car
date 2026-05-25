import { Link } from 'react-router-dom'
import { ArrowRight, Fuel, Gauge, ShieldCheck } from 'lucide-react'
import { getFallbackVehicleImageUrl, getVehicleImageUrl } from '../utils/imageUtils'

function VehicleCard({ vehicle }) {
  const { id, name, price_per_day, image } = vehicle
  const finalImageUrl = getVehicleImageUrl(image, id)

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#080808] shadow-[0_28px_80px_rgba(0,0,0,0.34)] transition duration-500 hover:-translate-y-1 hover:border-[#d4af37]/45 hover:shadow-[0_36px_100px_rgba(0,0,0,0.55)]">
      <div className="relative aspect-[16/11] overflow-hidden bg-[#050505]">
        <img
          src={finalImageUrl}
          alt={name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          style={{ filter: 'brightness(0.92) contrast(1.08) saturate(1.05)' }}
          onError={(e) => {
            e.currentTarget.src = getFallbackVehicleImageUrl(id)
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/16 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-[#d4af37]/30 bg-black/55 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#d4af37] backdrop-blur-md">
          Disponible
        </div>
      </div>

      <div className="relative p-5 sm:p-6">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Flota premium</p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">{name}</h3>
          </div>
          <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-2 text-right">
            <p className="text-2xl font-black text-[#d4af37]">{price_per_day}€</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">/ día</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">
          <span className="flex items-center gap-1.5 rounded-xl bg-white/[0.035] px-2 py-2"><Gauge className="h-3.5 w-3.5 text-[#d4af37]" /> Auto</span>
          <span className="flex items-center gap-1.5 rounded-xl bg-white/[0.035] px-2 py-2"><Fuel className="h-3.5 w-3.5 text-[#d4af37]" /> Full</span>
          <span className="flex items-center gap-1.5 rounded-xl bg-white/[0.035] px-2 py-2"><ShieldCheck className="h-3.5 w-3.5 text-[#d4af37]" /> Seguro</span>
        </div>

        <Link
          to={`/booking?vehicle=${id}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-[#d4af37]/30 bg-white/[0.035] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-[#d4af37] hover:bg-gold-gradient hover:text-black"
        >
          Reservar ahora
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}

export default VehicleCard
