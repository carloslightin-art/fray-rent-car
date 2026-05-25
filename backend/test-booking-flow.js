#!/usr/bin/env node
/**
 * SCRIPT DE PRUEBA - Flujo completo de reserva
 * Simula: Home → BookingForm → Crear Cliente → Crear Reserva
 */

const http = require('http')
const API_URL = process.env.API_URL || 'http://localhost:5001'

const request = (method, path, data) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL)
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          })
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          })
        }
      })
    })

    req.on('error', reject)
    if (data) req.write(JSON.stringify(data))
    req.end()
  })
}

const log = (title, data) => {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`✓ ${title}`)
  console.log(`${'='.repeat(60)}`)
  console.log(JSON.stringify(data, null, 2))
}

const error = (title, data) => {
  console.log(`\n${'!'.repeat(60)}`)
  console.log(`✗ ${title}`)
  console.log(`${'!'.repeat(60)}`)
  console.log(JSON.stringify(data, null, 2))
}

const test = async () => {
  console.log('\n🚀 INICIANDO PRUEBA - FLUJO COMPLETO DE RESERVA\n')

  try {
    // 1. Health check
    console.log('1️⃣  Verificando conexión al servidor...')
    const health = await request('GET', '/api/health')
    if (health.status !== 200) {
      error('Health check fallido', health)
      process.exit(1)
    }
    log('✅ Servidor activo', health.body)

    // 2. Obtener vehículos disponibles
    console.log('\n2️⃣  Obteniendo vehículos disponibles...')
    const vehiclesRes = await request('GET', '/api/vehicles/active')
    if (vehiclesRes.status !== 200) {
      error('No se pudieron obtener vehículos', vehiclesRes)
      process.exit(1)
    }
    const vehicles = vehiclesRes.body?.data || vehiclesRes.body
    log(`✅ Encontrados ${vehicles.length} vehículos`, vehicles.slice(0, 2))

    if (vehicles.length === 0) {
      error('Sin vehículos disponibles', { mensaje: 'No hay vehículos activos en la BD' })
      process.exit(1)
    }

    // 3. Crear cliente
    console.log('\n3️⃣  Creando cliente...')
    const clientData = {
      name: 'Test User ' + Date.now(),
      email: `test+${Date.now()}@frayrent.com`,
      phone: '+1 809 666 7777',
      license_number: 'ABC123XYZ'
    }
    const clientRes = await request('POST', '/api/clients', clientData)
    if (clientRes.status !== 201 && clientRes.status !== 200) {
      error('Error creando cliente', clientRes)
      process.exit(1)
    }
    const client = clientRes.body?.data || clientRes.body
    log('✅ Cliente creado', client)

    // 4. Crear reserva
    console.log('\n4️⃣  Creando reserva...')
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const dayAfter = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)

    const reservationData = {
      client_id: client.id,
      vehicle_id: vehicles[0].id,
      start_date: tomorrow.toISOString().split('T')[0],
      end_date: dayAfter.toISOString().split('T')[0],
      total_price: vehicles[0].price_per_day * 2 || 200,
      pickup_location: 'Santo Domingo Centro',
      drop_location: 'Aeropuerto Las Américas (SDQ)'
    }
    const reservationRes = await request('POST', '/api/reservations', reservationData)
    if (reservationRes.status !== 201 && reservationRes.status !== 200) {
      error('Error creando reserva', reservationRes)
      process.exit(1)
    }
    const reservation = reservationRes.body?.data || reservationRes.body
    log('✅ Reserva creada', reservation)

    // 5. Verificar que se pueda obtener el cliente
    console.log('\n5️⃣  Verificando cliente...')
    const getClientRes = await request('GET', `/api/clients/${client.id}`)
    if (getClientRes.status !== 200) {
      console.warn('⚠️  No se pudo obtener cliente específico (endpoint podría no existir)')
    } else {
      log('✅ Cliente verificado', getClientRes.body)
    }

    // Resumen final
    console.log('\n' + '='.repeat(60))
    console.log('✅ PRUEBA EXITOSA - FLUJO COMPLETO FUNCIONANDO')
    console.log('='.repeat(60))
    console.log(`
📊 RESUMEN:
- Cliente ID: ${client.id}
- Email: ${client.email}
- Reserva ID: ${reservation.id}
- Vehículo: ${vehicles[0].name || 'N/A'}
- Período: ${reservationData.start_date} → ${reservationData.end_date}
- Precio total: €${reservationData.total_price}

🎯 Próximos pasos:
1. Verificar datos en la BD (SELECT * FROM clients WHERE id = ${client.id})
2. Verificar reserva en BD (SELECT * FROM reservations WHERE id = ${reservation.id})
3. Probar en frontend: http://localhost:5173/booking
    `)

  } catch (err) {
    error('Error inesperado', err.message)
    process.exit(1)
  }
}

test()
