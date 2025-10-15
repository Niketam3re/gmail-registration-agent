const express = require('express');
const { verifyWebhookSignature, validateWebhookPayload, sanitizeInput } = require('../middleware/validation');
const logger = require('../config/logger');

const router = express.Router();

// Webhook endpoint for external systems to receive notifications
router.post('/receive', sanitizeInput, async (req, res) => {
  try {
    const { eventType, clientId, data } = req.body;
    
    logger.info(`Received webhook: ${eventType} for client ${clientId}`);
    
    // Process webhook based on event type
    switch (eventType) {
      case 'registration':
        await handleRegistrationWebhook(clientId, data);
        break;
      case 'watch_renewal':
        await handleWatchRenewalWebhook(clientId, data);
        break;
      case 'token_refresh':
        await handleTokenRefreshWebhook(clientId, data);
        break;
      default:
        logger.warn(`Unknown webhook event type: ${eventType}`);
        return res.status(400).json({
          error: 'Unknown event type',
          code: 'UNKNOWN_EVENT_TYPE'
        });
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      code: 'WEBHOOK_PROCESSING_ERROR'
    });
  }
});

// Webhook status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Webhook test endpoint
router.post('/test', sanitizeInput, async (req, res) => {
  try {
    const { testData } = req.body;
    
    logger.info('Webhook test endpoint called', { testData });
    
    res.json({
      success: true,
      message: 'Webhook test successful',
      receivedData: testData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in webhook test:', error);
    res.status(500).json({
      error: 'Webhook test failed',
      code: 'WEBHOOK_TEST_ERROR'
    });
  }
});

// Helper functions for webhook processing
async function handleRegistrationWebhook(clientId, data) {
  logger.info(`Processing registration webhook for client ${clientId}`);
  
  // Here you would typically:
  // 1. Validate the webhook data
  // 2. Update external systems
  // 3. Send notifications
  // 4. Log the event
  
  // For now, just log the event
  logger.info('Registration webhook processed', {
    clientId,
    registrationData: data.registrationData,
    credentials: data.credentials ? 'present' : 'missing',
    metadata: data.metadata
  });
}

async function handleWatchRenewalWebhook(clientId, data) {
  logger.info(`Processing watch renewal webhook for client ${clientId}`);
  
  // Here you would typically:
  // 1. Update external systems about the renewal
  // 2. Send notifications if needed
  // 3. Log the event
  
  logger.info('Watch renewal webhook processed', {
    clientId,
    renewalData: data.renewalData,
    clientData: data.clientData
  });
}

async function handleTokenRefreshWebhook(clientId, data) {
  logger.info(`Processing token refresh webhook for client ${clientId}`);
  
  // Here you would typically:
  // 1. Update external systems with new token info
  // 2. Send notifications if needed
  // 3. Log the event
  
  logger.info('Token refresh webhook processed', {
    clientId,
    refreshData: data.refreshData,
    clientData: data.clientData
  });
}

module.exports = router;