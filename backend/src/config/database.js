const { Sequelize } = require('sequelize')

const requiredEnv = ['DB_NAME', 'DB_USER', 'DB_HOST']
const missing = requiredEnv.filter((key) => !process.env[key] || String(process.env[key]).trim() === '')

if (missing.length > 0) {
  throw new Error(`Faltan variables de entorno requeridas para DB: ${missing.join(', ')}`)
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false
  }
)

module.exports = sequelize
