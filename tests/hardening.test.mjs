import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8')

test('admin login no expone ni precarga credenciales demo', () => {
  const source = read('admin-panel', 'src', 'pages', 'Login.jsx')
  assert.equal(source.includes('Credenciales de prueba'), false)
  assert.equal(source.includes('owner123'), false)
  assert.equal(source.includes('worker123'), false)
  assert.equal(source.includes("password: 'admin123'"), false)
  assert.equal(source.includes("email: 'owner@frayrentcar.com'"), false)
})

test('backend no devuelve error.message directamente en controladores', () => {
  const controllersDir = path.join(root, 'backend', 'src', 'controllers')
  const offenders = fs.readdirSync(controllersDir)
    .filter((name) => name.endsWith('.js'))
    .filter((name) => /error\s*:\s*error\.message/.test(read('backend', 'src', 'controllers', name)))
  assert.deepEqual(offenders, [])
})

test('servicios frontend tienen fallback de API URL consistente', () => {
  const adminApi = read('admin-panel', 'src', 'services', 'api.js')
  const publicApi = read('web-public', 'src', 'services', 'api.js')
  assert.match(adminApi, /import\.meta\.env\.VITE_API_URL\s*\|\|\s*['"]http:\/\/localhost:5001\/api['"]/) 
  assert.match(publicApi, /import\.meta\.env\.VITE_API_URL\s*\|\|\s*['"]http:\/\/localhost:5001\/api['"]/) 
})

test('web publica no contiene botones o enlaces decorativos principales', () => {
  const contact = read('web-public', 'src', 'pages', 'Contact.jsx')
  const navbar = read('web-public', 'src', 'components', 'Navbar.jsx')
  assert.equal(contact.includes('próximamente'), false)
  assert.equal(contact.includes('disabled'), false)
  assert.equal(navbar.includes("{ name: 'Ofertas', to: '/fleet' }"), false)
})
