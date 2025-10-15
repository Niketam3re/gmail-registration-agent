const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  gmailAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  // Encrypted OAuth tokens
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tokenExpiry: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Gmail watch subscription details
  watchTopic: {
    type: DataTypes.STRING,
    allowNull: true
  },
  watchExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  watchHistoryId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Registration metadata
  registrationStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'expired'),
    defaultValue: 'pending'
  },
  lastRenewalAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  webhookDelivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  webhookDeliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Consent and compliance
  consentGiven: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  consentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  privacyPolicyVersion: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'clients',
  indexes: [
    {
      fields: ['gmail_address']
    },
    {
      fields: ['email']
    },
    {
      fields: ['registration_status']
    },
    {
      fields: ['watch_expiry']
    }
  ]
});

// Instance methods
Client.prototype.encryptTokens = function() {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  if (this.accessToken && !this.accessToken.startsWith('encrypted:')) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(this.accessToken, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    this.accessToken = `encrypted:${iv.toString('hex')}:${encrypted}`;
  }
  
  if (this.refreshToken && !this.refreshToken.startsWith('encrypted:')) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(this.refreshToken, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    this.refreshToken = `encrypted:${iv.toString('hex')}:${encrypted}`;
  }
};

Client.prototype.decryptTokens = function() {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  if (this.accessToken && this.accessToken.startsWith('encrypted:')) {
    const [prefix, ivHex, encrypted] = this.accessToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    this.accessToken = decrypted;
  }
  
  if (this.refreshToken && this.refreshToken.startsWith('encrypted:')) {
    const [prefix, ivHex, encrypted] = this.refreshToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    this.refreshToken = decrypted;
  }
};

// Hooks
Client.beforeSave((client) => {
  client.encryptTokens();
});

Client.afterFind((clients) => {
  if (Array.isArray(clients)) {
    clients.forEach(client => client.decryptTokens());
  } else if (clients) {
    clients.decryptTokens();
  }
});

module.exports = Client;