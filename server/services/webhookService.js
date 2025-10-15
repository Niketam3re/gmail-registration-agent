const axios = require('axios');
const crypto = require('crypto');
const logger = require('../config/logger');

class WebhookService {
  constructor() {
    this.webhookUrl = process.env.WEBHOOK_BASE_URL;
    this.webhookSecret = process.env.WEBHOOK_SECRET;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  generateSignature(payload) {
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(payload);
    return hmac.digest('hex');
  }

  async sendWebhook(clientData, eventType = 'registration') {
    if (!this.webhookUrl) {
      logger.warn('Webhook URL not configured, skipping webhook delivery');
      return { success: false, error: 'Webhook URL not configured' };
    }

    const payload = {
      eventType,
      clientId: clientData.id,
      timestamp: new Date().toISOString(),
      data: {
        registrationData: {
          name: clientData.name,
          email: clientData.email,
          company: clientData.company,
          gmailAddress: clientData.gmailAddress
        },
        credentials: {
          accessToken: clientData.accessToken,
          refreshToken: clientData.refreshToken,
          expiryDate: clientData.tokenExpiry
        },
        metadata: {
          registeredAt: clientData.createdAt,
          watchExpiration: clientData.watchExpiry,
          lastRenewalAt: clientData.lastRenewalAt
        }
      }
    };

    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString);

    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': `sha256=${signature}`,
      'User-Agent': 'Gmail-Agent-Registration/1.0'
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        logger.info(`Sending webhook (attempt ${attempt}/${this.retryAttempts}) for client ${clientData.id}`);
        
        const response = await axios.post(this.webhookUrl, payload, {
          headers,
          timeout: 10000 // 10 second timeout
        });

        if (response.status >= 200 && response.status < 300) {
          logger.info(`Webhook delivered successfully for client ${clientData.id}`);
          return {
            success: true,
            attempt,
            response: {
              status: response.status,
              data: response.data
            }
          };
        } else {
          throw new Error(`Webhook returned status ${response.status}`);
        }
      } catch (error) {
        logger.error(`Webhook attempt ${attempt} failed for client ${clientData.id}:`, error.message);
        
        if (attempt === this.retryAttempts) {
          return {
            success: false,
            error: error.message,
            attempts: attempt
          };
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  async sendWatchRenewalWebhook(clientData, renewalData) {
    const payload = {
      eventType: 'watch_renewal',
      clientId: clientData.id,
      timestamp: new Date().toISOString(),
      data: {
        renewalData: {
          newHistoryId: renewalData.historyId,
          newExpiration: renewalData.expiration,
          renewedAt: new Date().toISOString()
        },
        clientData: {
          gmailAddress: clientData.gmailAddress,
          lastRenewalAt: clientData.lastRenewalAt
        }
      }
    };

    return this.sendWebhook(payload, 'watch_renewal');
  }

  async sendTokenRefreshWebhook(clientData, refreshData) {
    const payload = {
      eventType: 'token_refresh',
      clientId: clientData.id,
      timestamp: new Date().toISOString(),
      data: {
        refreshData: {
          newAccessToken: refreshData.accessToken,
          newExpiryDate: refreshData.expiryDate,
          refreshedAt: new Date().toISOString()
        },
        clientData: {
          gmailAddress: clientData.gmailAddress,
          email: clientData.email
        }
      }
    };

    return this.sendWebhook(payload, 'token_refresh');
  }

  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      logger.warn('Webhook secret not configured, cannot verify signature');
      return false;
    }

    const expectedSignature = this.generateSignature(payload);
    const providedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  }
}

module.exports = new WebhookService();