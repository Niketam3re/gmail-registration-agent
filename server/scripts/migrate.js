require('dotenv').config();
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const migrate = async () => {
  try {
    logger.info('Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Sync all models (create tables)
    await sequelize.sync({ force: false, alter: true });
    logger.info('Database models synchronized');
    
    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_gmail_address ON clients(gmail_address);
      CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
      CREATE INDEX IF NOT EXISTS idx_clients_registration_status ON clients(registration_status);
      CREATE INDEX IF NOT EXISTS idx_clients_watch_expiry ON clients(watch_expiry);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_client_id ON audit_logs(client_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    `);
    logger.info('Database indexes created');
    
    logger.info('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  }
};

migrate();