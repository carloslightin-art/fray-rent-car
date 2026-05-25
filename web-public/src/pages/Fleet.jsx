import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import VehicleCard from '../components/VehicleCard'
import { getVehicles } from '../services/api'
import { luxuryVehicles } from '../data/vehicles'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

function Fleet() {
  const [vehiclesState, setVehiclesState] = useState(luxuryVehicles)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true)
        const response = await getVehicles()
        if (response.data && response.data.length > 0) {
          const mappedVehicles = response.data
            .filter((v) => v.is_active !== false)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((v) => ({
              id: v.id,
              name: `${v.brand} ${v.model}`,
              price_per_day: v.price_per_day,
              image: v.image_url
            }))
          setVehiclesState(mappedVehicles.length ? mappedVehicles : luxuryVehicles)
        }
      } catch (_error) {
        setVehiclesState(luxuryVehicles)
      } finally {
        setLoading(false)
      }
    }
    loadVehicles()
  }, [])

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-12 pt-32 sm:px-6 sm:pt-36 lg:px-8 lg:pt-40">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#090909_0%,#030303_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_20%,rgba(212,175,55,0.16),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#d4af37]">Colección premium</p>
          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">Nuestra flota disponible</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">Vehículos seleccionados para reservas rápidas, entregas flexibles y una experiencia visual de lujo tanto en móvil como en escritorio.</p>
          <Link to="/booking" className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-gold-gradient px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-black">
            Reservar un vehículo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="grid place-items-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {vehiclesState.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Fleet
