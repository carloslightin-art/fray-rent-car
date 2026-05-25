const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const WebsiteContent = sequelize.define('WebsiteContent', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  section: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  key_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  value_type: {
    type: DataTypes.ENUM('text', 'number', 'boolean', 'json'),
    defaultValue: 'text'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'website_content',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['section', 'key_name']
    }
  ]
})

module.exports = WebsiteContent
