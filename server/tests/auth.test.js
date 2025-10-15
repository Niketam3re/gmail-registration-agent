const request = require('supertest');
const app = require('../index');
const { sequelize } = require('../config/database');
const Client = require('../models/Client');

describe('Authentication Routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Client.destroy({ where: {} });
  });

  describe('POST /api/auth/pre-register', () => {
    it('should accept valid registration data', async () => {
      const registrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp',
        gmailAddress: 'john.doe@gmail.com',
        consentGiven: true
      };

      const response = await request(app)
        .post('/api/auth/pre-register')
        .send(registrationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Registration data saved');
    });

    it('should reject invalid email', async () => {
      const registrationData = {
        name: 'John Doe',
        email: 'invalid-email',
        company: 'Acme Corp',
        gmailAddress: 'john.doe@gmail.com',
        consentGiven: true
      };

      const response = await request(app)
        .post('/api/auth/pre-register')
        .send(registrationData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject non-Gmail address', async () => {
      const registrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp',
        gmailAddress: 'john@outlook.com',
        consentGiven: true
      };

      const response = await request(app)
        .post('/api/auth/pre-register')
        .send(registrationData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject without consent', async () => {
      const registrationData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp',
        gmailAddress: 'john.doe@gmail.com',
        consentGiven: false
      };

      const response = await request(app)
        .post('/api/auth/pre-register')
        .send(registrationData)
        .expect(400);

      expect(response.body.error).toBe('Consent must be given to proceed');
    });
  });

  describe('GET /api/auth/google', () => {
    it('should return OAuth URL', async () => {
      const response = await request(app)
        .get('/api/auth/google')
        .expect(200);

      expect(response.body.authUrl).toBeDefined();
      expect(response.body.state).toBeDefined();
      expect(response.body.authUrl).toContain('accounts.google.com');
    });
  });

  describe('POST /api/auth/revoke', () => {
    it('should revoke client access', async () => {
      // Create a test client
      const client = await Client.create({
        name: 'Test User',
        email: 'test@example.com',
        gmailAddress: 'test@gmail.com',
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        registrationStatus: 'completed',
        consentGiven: true,
        consentDate: new Date()
      });

      const response = await request(app)
        .post('/api/auth/revoke')
        .send({ clientId: client.id })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify client status was updated
      const updatedClient = await Client.findByPk(client.id);
      expect(updatedClient.registrationStatus).toBe('expired');
    });

    it('should return 404 for non-existent client', async () => {
      const response = await request(app)
        .post('/api/auth/revoke')
        .send({ clientId: 'non-existent-id' })
        .expect(404);

      expect(response.body.error).toBe('Client not found');
    });
  });
});