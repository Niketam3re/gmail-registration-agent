const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM(
      'registration_started',
      'oauth_authorized',
      'registration_completed',
      'token_refreshed',
      'watch_created',
      'watch_renewed',
      'webhook_sent',
      'webhook_failed',
      'registration_failed',
      'client_deleted'
    ),
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.INET,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  indexes: [
    {
      fields: ['client_id']
    },
    {
      fields: ['action']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = AuditLog;