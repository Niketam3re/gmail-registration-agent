const { body, param, query, validationResult } = require('express-validator');
const logger = require('../config/logger');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  next();
};

const validateClientRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address required'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must be less than 100 characters'),
  body('gmailAddress')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid Gmail address required'),
  body('consentGiven')
    .isBoolean()
    .withMessage('Consent must be explicitly given'),
  handleValidationErrors
];

const validateWebhookPayload = [
  body('eventType')
    .isIn(['registration', 'watch_renewal', 'token_refresh'])
    .withMessage('Valid event type required'),
  body('clientId')
    .isUUID()
    .withMessage('Valid client ID required'),
  body('data')
    .isObject()
    .withMessage('Data object required'),
  handleValidationErrors
];

const validateClientId = [
  param('id')
    .isUUID()
    .withMessage('Valid client ID required'),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const sanitizeInput = (req, res, next) => {
  // Basic XSS protection
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

module.exports = {
  handleValidationErrors,
  validateClientRegistration,
  validateWebhookPayload,
  validateClientId,
  validatePagination,
  sanitizeInput
};