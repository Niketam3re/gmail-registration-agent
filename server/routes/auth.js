const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Client = require('../models/Client');
const AuditLog = require('../models/AuditLog');
const oauthService = require('../services/oauthService');
const gmailService = require('../services/gmailService');
const webhookService = require('../services/webhookService');
const { generateToken } = require('../middleware/auth');
const { validateClientRegistration, sanitizeInput } = require('../middleware/validation');
const logger = require('../config/logger');

const router = express.Router();

// Start OAuth flow
router.get('/google', (req, res) => {
  try {
    const state = uuidv4();
    const authUrl = oauthService.getAuthUrl(state);
    
    // Store state in session for verification
    req.session.oauthState = state;
    req.session.registrationData = req.query;
    
    logger.info('OAuth flow initiated', { state, clientIP: req.ip });
    res.json({ authUrl, state });
  } catch (error) {
    logger.error('Error initiating OAuth flow:', error);
    res.status(500).json({ 
      error: 'Failed to initiate OAuth flow',
      code: 'OAUTH_INIT_ERROR'
    });
  }
});

// OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      logger.warn('OAuth authorization denied:', error);
      return res.status(400).json({
        error: 'Authorization denied',
        code: 'OAUTH_DENIED',
        details: error
      });
    }

    if (!code || !state) {
      return res.status(400).json({
        error: 'Missing authorization code or state',
        code: 'OAUTH_INVALID_CALLBACK'
      });
    }

    // Verify state parameter
    if (state !== req.session.oauthState) {
      logger.warn('Invalid OAuth state parameter');
      return res.status(400).json({
        error: 'Invalid state parameter',
        code: 'OAUTH_INVALID_STATE'
      });
    }

    // Get tokens from Google
    const tokenData = await oauthService.getTokens(code);
    
    // Test Gmail connection
    const gmailProfile = await gmailService.getProfile(tokenData.accessToken);
    
    // Get registration data from session
    const registrationData = req.session.registrationData || {};
    
    // Check if client already exists
    let client = await Client.findOne({
      where: { gmailAddress: gmailProfile.emailAddress }
    });

    if (client) {
      // Update existing client
      client.name = registrationData.name || tokenData.name || client.name;
      client.email = registrationData.email || client.email;
      client.company = registrationData.company || client.company;
      client.accessToken = tokenData.accessToken;
      client.refreshToken = tokenData.refreshToken;
      client.tokenExpiry = tokenData.expiryDate;
      client.registrationStatus = 'completed';
      client.consentGiven = true;
      client.consentDate = new Date();
    } else {
      // Create new client
      client = await Client.create({
        name: registrationData.name || tokenData.name,
        email: registrationData.email || tokenData.email,
        company: registrationData.company,
        gmailAddress: gmailProfile.emailAddress,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiry: tokenData.expiryDate,
        registrationStatus: 'completed',
        consentGiven: true,
        consentDate: new Date()
      });
    }

    // Create Gmail watch subscription
    try {
      const watchData = await gmailService.createWatchSubscription(
        tokenData.accessToken, 
        gmailProfile.emailAddress
      );
      
      client.watchHistoryId = watchData.historyId;
      client.watchExpiry = watchData.expiration;
      await client.save();
      
      logger.info(`Gmail watch subscription created for ${gmailProfile.emailAddress}`);
    } catch (watchError) {
      logger.error('Failed to create Gmail watch subscription:', watchError);
      // Don't fail the registration, just log the error
    }

    // Send webhook notification
    try {
      const webhookResult = await webhookService.sendWebhook(client);
      client.webhookDelivered = webhookResult.success;
      client.webhookDeliveredAt = new Date();
      await client.save();
      
      logger.info(`Webhook sent for client ${client.id}:`, webhookResult);
    } catch (webhookError) {
      logger.error('Failed to send webhook:', webhookError);
      // Don't fail the registration, just log the error
    }

    // Log successful registration
    await AuditLog.create({
      clientId: client.id,
      action: 'registration_completed',
      success: true,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        gmailAddress: gmailProfile.emailAddress,
        messagesTotal: gmailProfile.messagesTotal,
        threadsTotal: gmailProfile.threadsTotal
      }
    });

    // Generate JWT token for client
    const jwtToken = generateToken({
      clientId: client.id,
      gmailAddress: client.gmailAddress,
      email: client.email
    });

    // Clear session data
    delete req.session.oauthState;
    delete req.session.registrationData;

    logger.info(`Registration completed successfully for client ${client.id}`);
    
    res.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        gmailAddress: client.gmailAddress,
        registeredAt: client.createdAt
      },
      token: jwtToken,
      watchSubscription: {
        historyId: client.watchHistoryId,
        expiresAt: client.watchExpiry
      }
    });

  } catch (error) {
    logger.error('Error in OAuth callback:', error);
    
    // Log failed registration
    await AuditLog.create({
      action: 'registration_failed',
      success: false,
      errorMessage: error.message,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR',
      details: error.message
    });
  }
});

// Pre-registration form submission
router.post('/pre-register', sanitizeInput, validateClientRegistration, async (req, res) => {
  try {
    const { name, email, company, gmailAddress, consentGiven } = req.body;
    
    if (!consentGiven) {
      return res.status(400).json({
        error: 'Consent must be given to proceed',
        code: 'CONSENT_REQUIRED'
      });
    }

    // Store registration data in session
    req.session.registrationData = {
      name,
      email,
      company,
      gmailAddress,
      consentGiven
    };

    // Log pre-registration
    await AuditLog.create({
      action: 'registration_started',
      success: true,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: { name, email, company, gmailAddress }
    });

    logger.info('Pre-registration completed', { email, gmailAddress });
    
    res.json({
      success: true,
      message: 'Registration data saved. Proceed to OAuth authorization.',
      nextStep: 'oauth'
    });

  } catch (error) {
    logger.error('Error in pre-registration:', error);
    res.status(500).json({
      error: 'Pre-registration failed',
      code: 'PRE_REGISTRATION_ERROR'
    });
  }
});

// Revoke access
router.post('/revoke', async (req, res) => {
  try {
    const { clientId } = req.body;
    
    if (!clientId) {
      return res.status(400).json({
        error: 'Client ID required',
        code: 'MISSING_CLIENT_ID'
      });
    }

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Decrypt tokens
    client.decryptTokens();

    // Revoke Gmail access
    try {
      await oauthService.revokeToken(client.accessToken);
      await gmailService.stopWatchSubscription(client.accessToken);
    } catch (revokeError) {
      logger.warn('Error revoking Gmail access:', revokeError);
    }

    // Update client status
    client.registrationStatus = 'expired';
    await client.save();

    // Log revocation
    await AuditLog.create({
      clientId: client.id,
      action: 'client_deleted',
      success: true,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Access revoked for client ${clientId}`);
    
    res.json({
      success: true,
      message: 'Access revoked successfully'
    });

  } catch (error) {
    logger.error('Error revoking access:', error);
    res.status(500).json({
      error: 'Failed to revoke access',
      code: 'REVOKE_ERROR'
    });
  }
});

module.exports = router;