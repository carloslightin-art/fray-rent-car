const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Vehicle = sequelize.define(
  'Vehicle',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    brand: { type: DataTypes.STRING(80), allowNull: false },
    model: { type: DataTypes.STRING(120), allowNull: false },
    year: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    price_per_day: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'maintenance'),
      allowNull: false,
      defaultValue: 'available'
    },
    category: {
      type: DataTypes.ENUM('economico', 'suv', 'premium', 'luxury'),
      allowNull: true,
      defaultValue: 'economico'
    },
    image_url: { type: DataTypes.STRING(500), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sort_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    }
  },
  {
    tableName: 'vehicles',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
  }
)

module.exports = Vehicle
