require('dotenv').config();
const { sequelize } = require('../config/database');
const Client = require('../models/Client');
const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

const seed = async () => {
  try {
    logger.info('Starting database seeding...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Clear existing data
    await AuditLog.destroy({ where: {} });
    await Client.destroy({ where: {} });
    logger.info('Existing data cleared');
    
    // Create sample clients
    const sampleClients = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corp',
        gmailAddress: 'john.doe@gmail.com',
        accessToken: 'sample_access_token_1',
        refreshToken: 'sample_refresh_token_1',
        tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        registrationStatus: 'completed',
        consentGiven: true,
        consentDate: new Date(),
        webhookDelivered: true,
        webhookDeliveredAt: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        company: 'Tech Solutions Inc',
        gmailAddress: 'jane.smith@gmail.com',
        accessToken: 'sample_access_token_2',
        refreshToken: 'sample_refresh_token_2',
        tokenExpiry: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        registrationStatus: 'completed',
        consentGiven: true,
        consentDate: new Date(),
        webhookDelivered: false
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        company: 'StartupXYZ',
        gmailAddress: 'bob.johnson@gmail.com',
        accessToken: 'sample_access_token_3',
        refreshToken: 'sample_refresh_token_3',
        tokenExpiry: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago (expired)
        registrationStatus: 'completed',
        consentGiven: true,
        consentDate: new Date(),
        webhookDelivered: true,
        webhookDeliveredAt: new Date()
      }
    ];
    
    const clients = await Client.bulkCreate(sampleClients);
    logger.info(`Created ${clients.length} sample clients`);
    
    // Create sample audit logs
    const sampleLogs = [
      {
        clientId: clients[0].id,
        action: 'registration_completed',
        success: true,
        details: { gmailAddress: 'john.doe@gmail.com' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        clientId: clients[1].id,
        action: 'registration_completed',
        success: true,
        details: { gmailAddress: 'jane.smith@gmail.com' },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        clientId: clients[2].id,
        action: 'registration_completed',
        success: true,
        details: { gmailAddress: 'bob.johnson@gmail.com' },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      },
      {
        clientId: clients[0].id,
        action: 'token_refreshed',
        success: true,
        details: { newExpiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      },
      {
        clientId: clients[1].id,
        action: 'webhook_sent',
        success: true,
        details: { webhookUrl: 'https://example.com/webhook' }
      }
    ];
    
    await AuditLog.bulkCreate(sampleLogs);
    logger.info(`Created ${sampleLogs.length} sample audit logs`);
    
    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seed();