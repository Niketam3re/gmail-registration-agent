const cron = require('node-cron');
const Client = require('../models/Client');
const AuditLog = require('../models/AuditLog');
const oauthService = require('./oauthService');
const gmailService = require('./gmailService');
const webhookService = require('./webhookService');
const logger = require('../config/logger');

class AutomationService {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
  }

  start() {
    if (this.isRunning) {
      logger.warn('Automation service is already running');
      return;
    }

    logger.info('Starting automation service...');

    // Check for expiring watch subscriptions every 6 hours
    this.jobs.set('watchRenewal', cron.schedule('0 */6 * * *', () => {
      this.checkAndRenewWatchSubscriptions();
    }));

    // Check for expiring tokens every hour
    this.jobs.set('tokenRefresh', cron.schedule('0 * * * *', () => {
      this.checkAndRefreshTokens();
    }));

    // Clean up old audit logs daily
    this.jobs.set('cleanup', cron.schedule('0 2 * * *', () => {
      this.cleanupOldLogs();
    }));

    this.isRunning = true;
    logger.info('Automation service started successfully');
  }

  stop() {
    if (!this.isRunning) {
      logger.warn('Automation service is not running');
      return;
    }

    logger.info('Stopping automation service...');
    
    this.jobs.forEach((job, name) => {
      job.destroy();
      logger.info(`Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    this.isRunning = false;
    logger.info('Automation service stopped');
  }

  async checkAndRenewWatchSubscriptions() {
    try {
      logger.info('Checking for expiring watch subscriptions...');
      
      // Find clients with watch subscriptions expiring in the next 24 hours
      const expiringSoon = new Date();
      expiringSoon.setHours(expiringSoon.getHours() + 24);
      
      const clients = await Client.findAll({
        where: {
          registrationStatus: 'completed',
          watchExpiry: {
            [require('sequelize').Op.lt]: expiringSoon
          }
        }
      });

      logger.info(`Found ${clients.length} clients with expiring watch subscriptions`);

      for (const client of clients) {
        try {
          await this.renewClientWatchSubscription(client);
        } catch (error) {
          logger.error(`Failed to renew watch subscription for client ${client.id}:`, error);
          
          await AuditLog.create({
            clientId: client.id,
            action: 'watch_renewed',
            success: false,
            errorMessage: error.message
          });
        }
      }
    } catch (error) {
      logger.error('Error in watch subscription renewal check:', error);
    }
  }

  async renewClientWatchSubscription(client) {
    try {
      // Decrypt tokens
      client.decryptTokens();
      
      // Refresh access token if needed
      let accessToken = client.accessToken;
      if (new Date() >= client.tokenExpiry) {
        const refreshResult = await oauthService.refreshAccessToken(client.refreshToken);
        accessToken = refreshResult.accessToken;
        client.accessToken = accessToken;
        client.tokenExpiry = refreshResult.expiryDate;
        await client.save();
      }

      // Renew watch subscription
      const renewalData = await gmailService.renewWatchSubscription(accessToken, client.gmailAddress);
      
      // Update client record
      client.watchHistoryId = renewalData.historyId;
      client.watchExpiry = renewalData.expiration;
      client.lastRenewalAt = new Date();
      await client.save();

      // Send webhook notification
      await webhookService.sendWatchRenewalWebhook(client, renewalData);

      // Log success
      await AuditLog.create({
        clientId: client.id,
        action: 'watch_renewed',
        success: true,
        details: {
          newExpiration: renewalData.expiration,
          historyId: renewalData.historyId
        }
      });

      logger.info(`Successfully renewed watch subscription for client ${client.id}`);
    } catch (error) {
      logger.error(`Failed to renew watch subscription for client ${client.id}:`, error);
      throw error;
    }
  }

  async checkAndRefreshTokens() {
    try {
      logger.info('Checking for expiring tokens...');
      
      // Find clients with tokens expiring in the next 2 hours
      const expiringSoon = new Date();
      expiringSoon.setHours(expiringSoon.getHours() + 2);
      
      const clients = await Client.findAll({
        where: {
          registrationStatus: 'completed',
          tokenExpiry: {
            [require('sequelize').Op.lt]: expiringSoon
          }
        }
      });

      logger.info(`Found ${clients.length} clients with expiring tokens`);

      for (const client of clients) {
        try {
          await this.refreshClientToken(client);
        } catch (error) {
          logger.error(`Failed to refresh token for client ${client.id}:`, error);
          
          await AuditLog.create({
            clientId: client.id,
            action: 'token_refreshed',
            success: false,
            errorMessage: error.message
          });
        }
      }
    } catch (error) {
      logger.error('Error in token refresh check:', error);
    }
  }

  async refreshClientToken(client) {
    try {
      // Decrypt refresh token
      client.decryptTokens();
      
      // Refresh access token
      const refreshResult = await oauthService.refreshAccessToken(client.refreshToken);
      
      // Update client record
      client.accessToken = refreshResult.accessToken;
      client.tokenExpiry = refreshResult.expiryDate;
      await client.save();

      // Send webhook notification
      await webhookService.sendTokenRefreshWebhook(client, refreshResult);

      // Log success
      await AuditLog.create({
        clientId: client.id,
        action: 'token_refreshed',
        success: true,
        details: {
          newExpiryDate: refreshResult.expiryDate
        }
      });

      logger.info(`Successfully refreshed token for client ${client.id}`);
    } catch (error) {
      logger.error(`Failed to refresh token for client ${client.id}:`, error);
      throw error;
    }
  }

  async cleanupOldLogs() {
    try {
      logger.info('Cleaning up old audit logs...');
      
      // Delete audit logs older than 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      
      const deletedCount = await AuditLog.destroy({
        where: {
          createdAt: {
            [require('sequelize').Op.lt]: cutoffDate
          }
        }
      });

      logger.info(`Cleaned up ${deletedCount} old audit log entries`);
    } catch (error) {
      logger.error('Error cleaning up old logs:', error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      jobCount: this.jobs.size
    };
  }
}

module.exports = new AutomationService();