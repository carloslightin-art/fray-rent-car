import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { getWebsiteSection } from '../services/websiteContent'
import { sendContactMessage } from '../services/api'

function Contact() {
  const [contact, setContact] = useState({
    title: 'Contacto',
    subtitle: 'Nuestro equipo está disponible para resolver dudas, gestionar reservas corporativas y diseñar soluciones premium a tu medida.',
    phone: '+1 809 000 0000',
    email: 'reservas@frayrentcar.com',
    address: 'Santo Domingo, República Dominicana',
    hours: 'Lun - Dom · 08:00 - 22:00',
    footer_phone: '+1 809 000 0000',
    footer_email: 'info@frayrentcar.com',
    footer_address: 'Santo Domingo, República Dominicana'
  })
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    loadContactData()
  }, [])

  const loadContactData = async () => {
    try {
      const response = await getWebsiteSection('contact')
      if (response.data) {
        setContact(prev => ({
          ...prev,
          title: response.data.title?.value || prev.title,
          subtitle: response.data.subtitle?.value || prev.subtitle,
          phone: response.data.phone?.value || prev.phone,
          email: response.data.email?.value || prev.email,
          address: response.data.address?.value || prev.address,
          hours: response.data.hours?.value || prev.hours
        }))
      }
    } catch (_error) {
      // Mantener defaults si la API no está disponible.
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (status) setStatus(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (sending) return
    setSending(true)
    setStatus(null)

    try {
      await sendContactMessage(form)
      setStatus({ type: 'success', text: 'Consulta enviada. Te contactaremos lo antes posible.' })
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setStatus({
        type: 'error',
        text: error.response?.data?.message || 'No se pudo enviar la consulta. Prueba por teléfono o email.'
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-luxuryBlack">
      <Navbar />

      <section className="relative overflow-hidden pb-8 pt-[150px] sm:pb-10 sm:pt-[175px] lg:pt-[170px]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#060606] to-luxuryBlack" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.08),transparent_50%)]" />
        
        <div className="relative section-wrap">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-luxuryGold/50" />
              <span className="text-luxuryGold text-[10px] sm:text-xs uppercase tracking-[0.3em] font-medium">Atención Personalizada</span>
              <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-luxuryGold/50" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-luxuryText">
              <span className="font-bold text-luxuryGold">{contact.title}</span>
            </h1>
            <p className="text-luxuryMuted text-xs sm:text-sm mt-3 sm:mt-4 max-w-xl mx-auto px-4">
              {contact.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="section-wrap pb-12 sm:pb-16">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-luxuryGold/20 bg-[#0a0a0a] p-5 sm:p-8">
            <h2 className="text-2xl font-semibold text-luxuryText mb-6">Información de Contacto</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-black/40 border border-luxuryGold/10 hover:border-luxuryGold/25 transition-colors">
                <div className="w-10 h-10 rounded-full bg-luxuryGold/10 flex items-center justify-center flex-shrink-0">
                  <FaPhoneAlt className="text-luxuryGold" />
                </div>
                <div>
                  <p className="text-xs text-luxuryMuted uppercase tracking-wider mb-1">Teléfono</p>
                  <a href={`tel:${contact.phone}`} className="text-luxuryText font-medium hover:text-luxuryGold">{contact.phone}</a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-black/40 border border-luxuryGold/10 hover:border-luxuryGold/25 transition-colors">
                <div className="w-10 h-10 rounded-full bg-luxuryGold/10 flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-luxuryGold" />
                </div>
                <div>
                  <p className="text-xs text-luxuryMuted uppercase tracking-wider mb-1">Email</p>
                  <a href={`mailto:${contact.email}`} className="text-luxuryText font-medium hover:text-luxuryGold">{contact.email}</a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-black/40 border border-luxuryGold/10 hover:border-luxuryGold/25 transition-colors">
                <div className="w-10 h-10 rounded-full bg-luxuryGold/10 flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-luxuryGold" />
                </div>
                <div>
                  <p className="text-xs text-luxuryMuted uppercase tracking-wider mb-1">Ubicación</p>
                  <p className="text-luxuryText font-medium">{contact.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-black/40 border border-luxuryGold/10 hover:border-luxuryGold/25 transition-colors">
                <div className="w-10 h-10 rounded-full bg-luxuryGold/10 flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-luxuryGold" />
                </div>
                <div>
                  <p className="text-xs text-luxuryMuted uppercase tracking-wider mb-1">Horario</p>
                  <p className="text-luxuryText font-medium">{contact.hours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-luxuryGold/20 bg-[#0a0a0a] p-5 sm:p-8">
            <h2 className="text-2xl font-semibold text-luxuryText mb-2">Envíanos un mensaje</h2>
            <p className="text-sm text-luxuryMuted mb-6">Recibiremos tu consulta en el sistema y podremos responder por email o teléfono.</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-luxuryMuted mb-2">Nombre completo</label>
                <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Ej: Juan García" className="input-luxury" required />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-luxuryMuted mb-2">Correo electrónico</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Ej: juan@email.com" className="input-luxury" required />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-luxuryMuted mb-2">Asunto</label>
                <input name="subject" type="text" value={form.subject} onChange={handleChange} placeholder="Ej: Consulta sobre reserva" className="input-luxury" required />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-luxuryMuted mb-2">Mensaje</label>
                <textarea name="message" rows="5" value={form.message} onChange={handleChange} placeholder="Escribe tu mensaje aquí..." className="input-luxury resize-none" required />
              </div>

              {status && (
                <div className={`rounded-lg border p-3 text-sm ${status.type === 'success' ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
                  {status.text}
                </div>
              )}
              
              <button type="submit" className="btn-gold w-full justify-center">
                {sending ? 'Enviando consulta...' : 'Enviar consulta'}
              </button>
            </form>
          </div>
        </div>

        {loading && <p className="mt-4 text-center text-xs text-luxuryMuted">Actualizando datos de contacto...</p>}
      </section>

      <Footer />
    </div>
  )
}

export default Contact
