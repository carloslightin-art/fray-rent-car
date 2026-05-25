import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { ShieldCheck, Clock, Plane, Sparkles } from 'lucide-react'

const offers = [
  {
    title: 'Fin de semana premium',
    badge: '2-3 días',
    description: 'Tarifa especial para escapadas de viernes a domingo con recogida flexible.',
    icon: Sparkles,
    cta: 'Reservar escapada'
  },
  {
    title: 'Aeropuerto sin esperas',
    badge: 'Entrega SDQ/PUJ',
    description: 'Entrega y devolución coordinada en aeropuertos de República Dominicana para viajes ejecutivos.',
    icon: Plane,
    cta: 'Reservar aeropuerto'
  },
  {
    title: 'Reserva anticipada',
    badge: 'Mejor precio',
    description: 'Bloquea disponibilidad y recibe prioridad en categoría ejecutiva o lujo.',
    icon: Clock,
    cta: 'Consultar fechas'
  },
  {
    title: 'Seguro incluido',
    badge: 'Tranquilidad',
    description: 'Cobertura incluida y asistencia durante todo el alquiler.',
    icon: ShieldCheck,
    cta: 'Ver condiciones'
  }
]

function Offers() {
  return (
    <div className="min-h-screen bg-luxuryBlack">
      <Navbar />
      <section className="section-wrap pt-32 sm:pt-40 pb-14">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-luxuryGold text-xs uppercase tracking-[0.35em]">Promociones activas</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-luxuryText">Ofertas FRAY RENT CAR</h1>
          <p className="mt-4 text-luxuryMuted text-sm sm:text-base">
            Paquetes comerciales reales para convertir visitas en reservas: fin de semana, aeropuerto, reserva anticipada y cobertura premium.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((offer) => {
            const Icon = offer.icon
            return (
              <article key={offer.title} className="rounded-2xl border border-luxuryGold/20 bg-[#0a0a0a] p-6 hover:border-luxuryGold/50 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full bg-luxuryGold/10 flex items-center justify-center">
                    <Icon className="text-luxuryGold" size={22} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-black bg-luxuryGold rounded-full px-3 py-1 font-bold">{offer.badge}</span>
                </div>
                <h2 className="text-xl font-bold text-luxuryText mb-3">{offer.title}</h2>
                <p className="text-sm text-luxuryMuted min-h-[84px]">{offer.description}</p>
                <Link to="/booking" className="mt-6 inline-flex w-full justify-center rounded-lg border border-luxuryGold/40 px-4 py-3 text-sm font-bold uppercase tracking-wider text-luxuryGold hover:bg-luxuryGold hover:text-black transition-colors">
                  {offer.cta}
                </Link>
              </article>
            )
          })}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default Offers
