const { sequelize } = require('../models')

const columns = [
  { name: 'gallery_images', ddl: 'JSON NULL' },
  { name: 'seats', ddl: 'INT UNSIGNED NOT NULL DEFAULT 5' },
  { name: 'vehicle_type', ddl: 'VARCHAR(80) NULL' },
  { name: 'insurance_included', ddl: 'TINYINT(1) NOT NULL DEFAULT 1' }
]

async function ensureVehicleSchema() {
  const table = 'vehicles'
  const dbName = process.env.DB_NAME
  if (!dbName) return

  for (const column of columns) {
    const existing = await sequelize.query(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      {
        replacements: [dbName, table, column.name],
        type: sequelize.QueryTypes.SELECT
      }
    )

    if (existing.length === 0) {
      await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${column.name} ${column.ddl}`)
      console.log(`✅ Columna añadida: ${table}.${column.name}`)
    }
  }
}

module.exports = { ensureVehicleSchema }
