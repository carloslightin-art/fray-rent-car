const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Client = sequelize.define(
  'Client',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(30), allowNull: false },
    license_number: { type: DataTypes.STRING(50), allowNull: false, unique: true }
  },
  {
    tableName: 'clients',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
  }
)

module.exports = Client
