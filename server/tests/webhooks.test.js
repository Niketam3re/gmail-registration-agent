const request = require('supertest');
const app = require('../index');

describe('Webhook Routes', () => {
  describe('POST /api/webhooks/receive', () => {
    it('should process registration webhook', async () => {
      const webhookData = {
        eventType: 'registration',
        clientId: 'test-client-id',
        data: {
          registrationData: {
            name: 'Test User',
            email: 'test@example.com',
            gmailAddress: 'test@gmail.com'
          }
        }
      };

      const response = await request(app)
        .post('/api/webhooks/receive')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should process watch renewal webhook', async () => {
      const webhookData = {
        eventType: 'watch_renewal',
        clientId: 'test-client-id',
        data: {
          renewalData: {
            newHistoryId: '12345',
            newExpiration: new Date().toISOString()
          }
        }
      };

      const response = await request(app)
        .post('/api/webhooks/receive')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should process token refresh webhook', async () => {
      const webhookData = {
        eventType: 'token_refresh',
        clientId: 'test-client-id',
        data: {
          refreshData: {
            newAccessToken: 'new_token',
            newExpiryDate: new Date().toISOString()
          }
        }
      };

      const response = await request(app)
        .post('/api/webhooks/receive')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject unknown event type', async () => {
      const webhookData = {
        eventType: 'unknown_event',
        clientId: 'test-client-id',
        data: {}
      };

      const response = await request(app)
        .post('/api/webhooks/receive')
        .send(webhookData)
        .expect(400);

      expect(response.body.error).toBe('Unknown event type');
    });
  });

  describe('GET /api/webhooks/status', () => {
    it('should return webhook status', async () => {
      const response = await request(app)
        .get('/api/webhooks/status')
        .expect(200);

      expect(response.body.status).toBe('active');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('POST /api/webhooks/test', () => {
    it('should handle test webhook', async () => {
      const testData = {
        testData: 'test message'
      };

      const response = await request(app)
        .post('/api/webhooks/test')
        .send(testData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.receivedData).toBe('test message');
    });
  });
});