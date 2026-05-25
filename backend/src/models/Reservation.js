const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Reservation = sequelize.define(
  'Reservation',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    client_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    vehicle_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'finished'),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    tableName: 'reservations',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
  }
)

module.exports = Reservation
