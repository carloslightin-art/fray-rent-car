const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { sequelize } = require('./models')
const { ensureVehicleSchema } = require('./utils/ensureVehicleSchema')

const authRoutes = require('./routes/auth')
const vehicleRoutes = require('./routes/vehicles')
const clientRoutes = require('./routes/clients')
const reservationRoutes = require('./routes/reservations')
const websiteContentRoutes = require('./routes/websiteContent')
const uploadRoutes = require('./routes/upload')
const userRoutes = require('./routes/users')
const dashboardRoutes = require('./routes/dashboard')
const contactRoutes = require('./routes/contact')

const app = express()

// ============================================================
// SEGURIDAD
// ============================================================

// Helmet: headers de seguridad. Las fotos públicas se sirven desde el API (5001)
// hacia frontends Vite/producción en otro origen, así que CORP debe permitir cross-origin.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// CORS: en desarrollo acepta cualquier origen; en producción usa CORS_ORIGIN
if (process.env.NODE_ENV === 'production') {
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(u => u.trim())
    : []
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      cb(null, corsOrigins.includes(origin))
    }
  }))
} else {
  app.use(cors())
}

// Rate limiting: proteger endpoints públicos
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api', publicLimiter)
app.use('/api/auth/login', authLimiter)

// Parseo de body
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// Fotos comerciales de vehículos: públicas de solo lectura para que la web pública pueda mostrarlas.
app.use('/uploads/vehicles', express.static(path.join(__dirname, '../uploads/vehicles'), {
  dotfiles: 'deny',
  fallthrough: false,
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'public, max-age=86400')
  }
}))

// Resto de uploads protegido con auth
const { authenticate } = require('./middleware/auth')
app.use('/uploads', authenticate, express.static(path.join(__dirname, '../uploads'), {
  dotfiles: 'deny',
  fallthrough: false,
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'private, max-age=300')
  }
}))

// ============================================================
// HEALTH CHECK MEJORADO
// ============================================================
app.get('/api/health', async (_req, res) => {
  const checks = {
    api: true,
    database: false,
    database_pool: false
  }

  try {
    await sequelize.authenticate()
    checks.database = true

    // Verificar que las tablas existen
    const tables = await sequelize.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      { replacements: [process.env.DB_NAME], type: sequelize.QueryTypes.SELECT }
    )
    checks.database_pool = tables.length >= 4
  } catch (error) {
    return res.status(503).json({
      status: 'degraded',
      message: 'Base de datos desconectada',
      checks,
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }

  const healthy = checks.database && checks.database_pool
  return res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    message: healthy ? 'Todo OK' : 'Base de datos con problemas',
    checks,
    uptime_seconds: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Root API endpoint
app.get('/api', (_req, res) => {
  return res.json({
    message: 'FRAY RENT CAR API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      clients: '/api/clients',
      reservations: '/api/reservations',
      websiteContent: '/api/website-content',
      upload: '/api/upload',
      users: '/api/users',
      dashboard: '/api/dashboard',
      contact: '/api/contact'
    }
  })
})

// ============================================================
// RUTAS
// ============================================================
app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/website-content', websiteContentRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/contact', contactRoutes)

// 404 handler
app.use((req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('404:', req.method, req.url)
  }
  res.status(404).json({
    message: 'Ruta no encontrada',
    method: req.method,
    url: req.url
  })
})

// Error handler global
app.use((err, req, res, _next) => {
  console.error('ERROR:', err.message || err)
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message
  })
})

// ============================================================
// ARRANQUE
// ============================================================
const PORT = process.env.PORT || 5001

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 20) {
  console.error('⚠️  CRÍTICO: JWT_SECRET débil o no configurado. El login NO funcionará.')
  console.error('   Configura JWT_SECRET en las variables de entorno.')
}

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate()
    await ensureVehicleSchema()
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
    console.log(`✅ MySQL conectado: ${process.env.DB_NAME}@${process.env.DB_HOST}`)
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`)
  } catch (error) {
    console.error('❌ No se pudo conectar a MySQL:', error.message)
  }
})
