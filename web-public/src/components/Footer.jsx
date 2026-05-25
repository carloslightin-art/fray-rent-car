import { Link } from 'react-router-dom'
import { Phone, Smartphone, ArrowRight } from 'lucide-react'

function Footer({
  phone = '+1 809 000 0000',
  phone2 = '+1 829 000 0000',
  copyright = '© 2025 FRAY RENT CAR. Todos los derechos reservados.'
}) {
  const phones = [
    { label: 'Teléfono directo', value: phone, Icon: Phone },
    { label: 'WhatsApp / reservas', value: phone2, Icon: Smartphone }
  ]

  return (
    <footer className="relative overflow-hidden border-t border-[#d4af37]/20 bg-[#020202]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(212,175,55,0.18),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Link to="/" className="inline-flex items-center gap-5">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-black sm:h-24 sm:w-24">
                <img src="/images/logo/logo-circle-fill.jpg" alt="FRAY RENT CAR" className="h-full w-full rounded-full object-cover object-center brightness-110 contrast-125" />
              </div>
              <div>
                <p className="text-4xl font-black tracking-[0.2em] text-white sm:text-5xl">FRAY</p>
                <p className="mt-2 text-sm font-black uppercase tracking-[0.38em] text-[#d4af37] sm:text-base">Rent Car</p>
              </div>
            </Link>
            <p className="mt-7 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
              Alquiler premium, flota seleccionada y experiencia digital optimizada para móvil y escritorio.
            </p>
            <Link to="/booking" className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-gold-gradient px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-black shadow-[0_18px_45px_rgba(212,175,55,0.23)]">
              Reservar ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-[#d4af37]/28 bg-[#070707]/90 p-4 shadow-[0_28px_95px_rgba(0,0,0,0.5),0_0_70px_rgba(212,175,55,0.08)] sm:p-5 lg:p-6">
            <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4 sm:mb-5 sm:gap-4 sm:pb-5">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-black sm:h-16 sm:w-16">
                <img src="/images/logo/logo-circle-fill.jpg" alt="FRAY RENT CAR" className="h-full w-full rounded-full object-cover object-center" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d4af37] sm:text-[11px] sm:tracking-[0.32em]">Contacto rápido</p>
                <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">Llámanos ahora</h3>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {phones.map(({ label, value, Icon }) => (
                <a
                  key={label}
                  href={`tel:${value.replace(/\s/g, '')}`}
                  className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#d4af37]/18 bg-[#d4af37]/[0.055] p-4 transition hover:border-[#d4af37]/55 hover:bg-[#d4af37]/12 sm:p-5 md:flex-col md:items-start md:justify-between md:gap-4"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#d4af37] text-black shadow-[0_12px_30px_rgba(212,175,55,0.22)] sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-[#d4af37] sm:text-[10px] sm:tracking-[0.24em]">{label}</span>
                    <span className="mt-1 block whitespace-nowrap text-[clamp(1.02rem,2.1vw,1.45rem)] font-black tracking-wide text-white">{value}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-zinc-500 sm:flex sm:items-center sm:justify-between sm:text-left">
          <p>{copyright}</p>
          <p className="mt-3 font-black uppercase tracking-[0.24em] text-[#d4af37] sm:mt-0">Luxury rental system</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
