import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import BookingForm from '../components/BookingForm'
import VehicleCard from '../components/VehicleCard'
import TrustServices from '../components/TrustServices'
import Footer from '../components/Footer'
import MobileAppHome from '../components/MobileAppHome'
import { getVehicles } from '../services/api'
import { getWebsiteSection } from '../services/websiteContent'
import { luxuryVehicles } from '../data/vehicles'
import useMobileAppMode from '../hooks/useMobileAppMode'
import { Link } from 'react-router-dom'
import { ArrowRight, MonitorSmartphone, Database, LayoutDashboard, Smartphone } from 'lucide-react'

function Home() {
  const isMobileAppMode = useMobileAppMode()
  const [fleetVehicles, setFleetVehicles] = useState(luxuryVehicles)
  const [footerData, setFooterData] = useState({
    phone: '+1 809 000 0000',
    email: 'info@frayrentcar.com',
    address: 'Santo Domingo, República Dominicana',
    copyright: '© 2025 FRAY RENT CAR. Todos los derechos reservados.'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        try {
          const vehiclesRes = await getVehicles()
          if (vehiclesRes.data && vehiclesRes.data.length > 0) {
            const apiVehicles = vehiclesRes.data.map((v) => ({
              id: v.id,
              name: `${v.brand} ${v.model}`,
              price_per_day: v.price_per_day,
              image: v.image_url,
              gallery_images: v.gallery_images || [],
              seats: v.seats || 5,
              vehicle_type: v.vehicle_type || v.category || 'Económico',
              insurance_included: v.insurance_included !== false
            }))
            const apiNames = new Set(apiVehicles.map((vehicle) => vehicle.name.toLowerCase().trim()))
            const fallbackVehicles = luxuryVehicles.filter((vehicle) => !apiNames.has(vehicle.name.toLowerCase().trim()))
            setFleetVehicles([...apiVehicles, ...fallbackVehicles])
          }
        } catch (_err) {
          setFleetVehicles(luxuryVehicles)
        }

        try {
          const footerRes = await getWebsiteSection('footer')
          if (footerRes.data) {
            setFooterData((prev) => ({
              phone: footerRes.data.phone?.value || prev.phone,
              email: footerRes.data.email?.value || prev.email,
              address: footerRes.data.address?.value || prev.address,
              copyright: footerRes.data.copyright?.value || prev.copyright
            }))
          }
        } catch (_err) {
          // Mantener datos por defecto si la API no responde.
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading && fleetVehicles.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#050505]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent" />
      </div>
    )
  }

  if (isMobileAppMode) {
    return <MobileAppHome vehicles={fleetVehicles} footerData={footerData} />
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <Navbar />
      <Hero />
      <BookingForm />

      <section className="relative overflow-hidden bg-[#030303] px-4 pb-16 pt-8 sm:px-6 sm:pb-20 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(212,175,55,0.1),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#d4af37]">Nuestra flota</p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">Vehículos listos para reservar desde cualquier pantalla</h2>
            </div>
            <Link to="/fleet" className="inline-flex items-center gap-3 rounded-2xl border border-[#d4af37]/35 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black lg:mb-2">
              Ver toda la flota
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {fleetVehicles.slice(0, 3).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#d4af37]/15 bg-[#080808] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(212,175,55,0.16),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#d4af37]">Web + App + Admin</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">Una experiencia que parece aplicación, pero corre en web</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400">La interfaz se está preparando para que funcione bien en computadora, tablet y móvil: reserva rápida, flota visual y panel conectado al sistema.</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                [MonitorSmartphone, 'Responsive real', 'Diseño adaptado a móvil y escritorio.'],
                [LayoutDashboard, 'Admin web', 'Gestión visual de reservas y flota.'],
                [Database, 'Datos conectados', 'API y base de datos como fuente real.'],
                [Smartphone, 'Experiencia app', 'Mobile-first sin instalar nada.']
              ].map(([Icon, title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <Icon className="h-5 w-5 text-[#d4af37]" />
                  <h3 className="mt-3 font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-square min-h-[360px] overflow-hidden rounded-[2rem] border border-[#d4af37]/20 bg-black shadow-[0_35px_120px_rgba(0,0,0,0.48)] sm:min-h-[520px]">
            <img src="/images/ui/phone-mockup-square.jpg" alt="App FRAY RENT CAR" className="absolute inset-0 h-full w-full object-cover object-center" />
          </div>
        </div>
      </section>

      <TrustServices />
      <Footer {...footerData} />
    </div>
  )
}

export default Home
