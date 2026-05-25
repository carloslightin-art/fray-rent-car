import { Shield, Plane, Headphones, CreditCard } from 'lucide-react'

const services = [
  ['Seguro incluido', 'Cobertura completa y condiciones claras antes de confirmar.', Shield],
  ['Entrega en aeropuerto', 'Recogida y devolución en puntos estratégicos de República Dominicana.', Plane],
  ['Atención 24/7', 'Soporte rápido para cambios, incidencias y asistencia.', Headphones],
  ['Reserva segura', 'Proceso online con confirmación y seguimiento del equipo.', CreditCard]
]

function TrustServices() {
  return (
    <section className="relative overflow-hidden border-t border-[#d4af37]/15 bg-[#050505] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.13),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#d4af37]">Servicio de confianza</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl lg:text-5xl">Premium de verdad, no solo bonito</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">La experiencia tiene que sentirse profesional desde el móvil hasta el escritorio: reserva clara, soporte real y vehículos listos para entregar.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(([title, description, Icon]) => (
            <article key={title} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-[#d4af37]/45 hover:bg-[#d4af37]/[0.055]">
              <div className="mb-5 grid h-13 w-13 place-items-center rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 text-[#d4af37] transition group-hover:bg-[#d4af37] group-hover:text-black">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustServices
