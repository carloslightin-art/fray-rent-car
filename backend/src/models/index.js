const sequelize = require('../config/database')
const User = require('./User')
const Vehicle = require('./Vehicle')
const Client = require('./Client')
const Reservation = require('./Reservation')
const WebsiteContent = require('./WebsiteContent')

Client.hasMany(Reservation, { foreignKey: 'client_id', as: 'reservations' })
Reservation.belongsTo(Client, { foreignKey: 'client_id', as: 'client' })

Vehicle.hasMany(Reservation, { foreignKey: 'vehicle_id', as: 'reservations' })
Reservation.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' })

module.exports = {
  sequelize,
  User,
  Vehicle,
  Client,
  Reservation,
  WebsiteContent
}
