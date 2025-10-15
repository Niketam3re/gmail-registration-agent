const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Invalid token provided:', err.message);
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    req.user = user;
    next();
  });
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  
  if (!signature) {
    return res.status(401).json({ 
      error: 'Webhook signature required',
      code: 'MISSING_SIGNATURE'
    });
  }

  const webhookService = require('../services/webhookService');
  const payload = JSON.stringify(req.body);
  
  if (!webhookService.verifyWebhookSignature(payload, signature)) {
    logger.warn('Invalid webhook signature received');
    return res.status(403).json({ 
      error: 'Invalid webhook signature',
      code: 'INVALID_SIGNATURE'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  generateToken,
  verifyWebhookSignature
};