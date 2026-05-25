const { sendServerError } = require('../utils/safeErrors')

const clean = (value) => String(value || '').trim()

exports.submitContact = async (req, res) => {
  try {
    const name = clean(req.body.name)
    const email = clean(req.body.email)
    const subject = clean(req.body.subject)
    const message = clean(req.body.message)

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Completa nombre, email, asunto y mensaje.' })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Email no válido.' })
    }

    // Fase 1: endpoint real y trazable. En producción se puede conectar aquí SMTP/CRM/WhatsApp.
    console.log('CONTACT_LEAD:', {
      name,
      email,
      subject,
      messageLength: message.length,
      createdAt: new Date().toISOString()
    })

    return res.status(202).json({
      message: 'Consulta recibida. Te contactaremos lo antes posible.',
      lead: { name, email, subject }
    })
  } catch (error) {
    return sendServerError(res, 'Error al recibir la consulta', error)
  }
}
