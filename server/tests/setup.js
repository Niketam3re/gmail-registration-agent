// Test setup file
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';
process.env.SESSION_SECRET = 'test-session-secret';

// Mock external services
jest.mock('../services/oauthService', () => ({
  getAuthUrl: jest.fn(() => 'https://accounts.google.com/oauth/authorize?test=true'),
  getTokens: jest.fn(() => Promise.reject(new Error('Mock OAuth error'))),
  refreshAccessToken: jest.fn(() => Promise.reject(new Error('Mock refresh error'))),
  revokeToken: jest.fn(() => Promise.reject(new Error('Mock revoke error'))),
  testConnection: jest.fn(() => Promise.reject(new Error('Mock test error')))
}));

jest.mock('../services/gmailService', () => ({
  createWatchSubscription: jest.fn(() => Promise.reject(new Error('Mock watch error'))),
  renewWatchSubscription: jest.fn(() => Promise.reject(new Error('Mock renew error'))),
  stopWatchSubscription: jest.fn(() => Promise.reject(new Error('Mock stop error'))),
  getProfile: jest.fn(() => Promise.reject(new Error('Mock profile error'))),
  getMessages: jest.fn(() => Promise.reject(new Error('Mock messages error')))
}));

jest.mock('../services/webhookService', () => ({
  sendWebhook: jest.fn(() => Promise.resolve({ success: true })),
  sendWatchRenewalWebhook: jest.fn(() => Promise.resolve({ success: true })),
  sendTokenRefreshWebhook: jest.fn(() => Promise.resolve({ success: true })),
  verifyWebhookSignature: jest.fn(() => true)
}));

// Global test timeout
jest.setTimeout(10000);