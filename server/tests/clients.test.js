const request = require('supertest');
const app = require('../index');
const { sequelize } = require('../config/database');
const Client = require('../models/Client');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../middleware/auth');

describe('Client Routes', () => {
  let authToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    authToken = generateToken({ clientId: 'test-client', email: 'test@example.com' });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await AuditLog.destroy({ where: {} });
    await Client.destroy({ where: {} });
  });

  describe('GET /api/clients', () => {
    it('should return paginated clients list', async () => {
      // Create test clients
      await Client.bulkCreate([
        {
          name: 'John Doe',
          email: 'john@example.com',
          gmailAddress: 'john@gmail.com',
          accessToken: 'token1',
          refreshToken: 'refresh1',
          tokenExpiry: new Date(),
          registrationStatus: 'completed',
          consentGiven: true,
          consentDate: new Date()
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          gmailAddress: 'jane@gmail.com',
          accessToken: 'token2',
          refreshToken: 'refresh2',
          tokenExpiry: new Date(),
          registrationStatus: 'completed',
          consentGiven: true,
          consentDate: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.clients).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(2);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/clients')
        .expect(401);
    });
  });

  describe('GET /api/clients/:id', () => {
    it('should return specific client', async () => {
      const client = await Client.create({
        name: 'Test User',
        email: 'test@example.com',
        gmailAddress: 'test@gmail.com',
        accessToken: 'token',
        refreshToken: 'refresh',
        tokenExpiry: new Date(),
        registrationStatus: 'completed',
        consentGiven: true,
        consentDate: new Date()
      });

      const response = await request(app)
        .get(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.client.id).toBe(client.id);
      expect(response.body.client.name).toBe('Test User');
    });

    it('should return 404 for non-existent client', async () => {
      await request(app)
        .get('/api/clients/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/clients/:id', () => {
    it('should update client information', async () => {
      const client = await Client.create({
        name: 'Original Name',
        email: 'original@example.com',
        gmailAddress: 'original@gmail.com',
        accessToken: 'token',
        refreshToken: 'refresh',
        tokenExpiry: new Date(),
        registrationStatus: 'completed',
        consentGiven: true,
        consentDate: new Date()
      });

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        company: 'New Company'
      };

      const response = await request(app)
        .put(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.client.name).toBe('Updated Name');
    });
  });

  describe('GET /api/clients/stats/overview', () => {
    it('should return client statistics', async () => {
      // Create test clients with different statuses
      await Client.bulkCreate([
        {
          name: 'Client 1',
          email: 'client1@example.com',
          gmailAddress: 'client1@gmail.com',
          accessToken: 'token1',
          refreshToken: 'refresh1',
          tokenExpiry: new Date(),
          registrationStatus: 'completed',
          consentGiven: true,
          consentDate: new Date(),
          webhookDelivered: true
        },
        {
          name: 'Client 2',
          email: 'client2@example.com',
          gmailAddress: 'client2@gmail.com',
          accessToken: 'token2',
          refreshToken: 'refresh2',
          tokenExpiry: new Date(),
          registrationStatus: 'pending',
          consentGiven: true,
          consentDate: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/clients/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.totalClients).toBe(2);
      expect(response.body.activeClients).toBe(1);
      expect(response.body.pendingClients).toBe(1);
      expect(response.body.webhookDeliveryRate).toBe('50.00');
    });
  });

  describe('GET /api/clients/search/:query', () => {
    it('should search clients by name', async () => {
      await Client.create({
        name: 'John Doe',
        email: 'john@example.com',
        gmailAddress: 'john@gmail.com',
        accessToken: 'token',
        refreshToken: 'refresh',
        tokenExpiry: new Date(),
        registrationStatus: 'completed',
        consentGiven: true,
        consentDate: new Date()
      });

      const response = await request(app)
        .get('/api/clients/search/John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.clients).toHaveLength(1);
      expect(response.body.clients[0].name).toBe('John Doe');
    });
  });
});