import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Phone, Sparkles } from 'lucide-react'

const navItems = [
  { name: 'Inicio', to: '/' },
  { name: 'Vehículos', to: '/fleet' },
  { name: 'Reservar', to: '/booking' },
  { name: 'Ofertas', to: '/offers' },
  { name: 'Contacto', to: '/contact' }
]

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-[#d4af37]/20 bg-[#030303]/88 backdrop-blur-xl supports-[backdrop-filter]:bg-[#030303]/72">
      <div className="mx-auto flex h-[98px] max-w-7xl items-center justify-between px-4 sm:h-[120px] sm:px-6 lg:h-[138px] lg:px-8">
        <Link to="/" className="group flex min-w-0 items-center gap-4 sm:gap-5" onClick={() => setMobileMenuOpen(false)}>
          <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-black sm:h-28 sm:w-28 lg:h-32 lg:w-32">
            <img
              src="/images/logo/logo-circle-fill.jpg"
              alt="FRAY RENT CAR"
              className="h-full w-full rounded-full object-cover object-center brightness-110 contrast-125"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling.style.display = 'grid'
              }}
            />
            <span className="hidden h-full w-full place-items-center rounded-full bg-gold-gradient text-sm font-black text-black">FR</span>
          </div>

          <div className="leading-none">
            <p className="text-[24px] font-black tracking-[0.18em] text-white sm:text-4xl lg:text-[40px]">FRAY</p>
            <p className="mt-1.5 text-[12px] font-black tracking-[0.36em] text-[#d4af37] sm:text-base lg:text-[17px]">RENT CAR</p>
          </div>
        </Link>

        <nav className="hidden items-center rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.18em] transition-all ${
                  isActive
                    ? 'bg-[#d4af37] text-black shadow-[0_0_22px_rgba(212,175,55,0.28)]'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-[#d4af37]'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a href="tel:+18090000000" className="flex items-center gap-2 text-sm font-semibold text-zinc-300 transition-colors hover:text-[#d4af37]">
            <Phone className="h-4 w-4 text-[#d4af37]" />
            +1 809 000 0000
          </a>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-3 text-[12px] font-black uppercase tracking-[0.2em] text-black shadow-[0_10px_35px_rgba(212,175,55,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(212,175,55,0.36)]"
          >
            <Sparkles className="h-4 w-4" />
            Reservar
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-[#d4af37]/30 bg-white/[0.04] text-[#d4af37] lg:hidden"
          onClick={() => setMobileMenuOpen((value) => !value)}
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#d4af37]/15 bg-[#050505]/98 px-4 pb-5 pt-2 shadow-2xl lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.22em] ${
                    isActive ? 'bg-[#d4af37] text-black' : 'text-zinc-200 hover:bg-white/5 hover:text-[#d4af37]'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <Link
              to="/booking"
              className="mt-3 block rounded-2xl bg-gold-gradient px-5 py-4 text-center text-sm font-black uppercase tracking-[0.22em] text-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reservar ahora
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
