const express = require('express');
const { Op } = require('sequelize');
const Client = require('../models/Client');
const AuditLog = require('../models/AuditLog');
const { authenticateToken } = require('../middleware/auth');
const { validateClientId, validatePagination, sanitizeInput } = require('../middleware/validation');
const logger = require('../config/logger');

const router = express.Router();

// Get all clients (admin only)
router.get('/', authenticateToken, sanitizeInput, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const { count, rows: clients } = await Client.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'name', 'email', 'company', 'gmailAddress', 
        'registrationStatus', 'createdAt', 'lastRenewalAt',
        'webhookDelivered', 'webhookDeliveredAt'
      ]
    });

    res.json({
      clients,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({
      error: 'Failed to fetch clients',
      code: 'FETCH_CLIENTS_ERROR'
    });
  }
});

// Get client by ID
router.get('/:id', authenticateToken, validateClientId, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      attributes: [
        'id', 'name', 'email', 'company', 'gmailAddress',
        'registrationStatus', 'createdAt', 'lastRenewalAt',
        'webhookDelivered', 'webhookDeliveredAt', 'consentGiven',
        'consentDate', 'privacyPolicyVersion'
      ]
    });

    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    res.json({ client });
  } catch (error) {
    logger.error('Error fetching client:', error);
    res.status(500).json({
      error: 'Failed to fetch client',
      code: 'FETCH_CLIENT_ERROR'
    });
  }
});

// Get client audit logs
router.get('/:id/audit-logs', authenticateToken, validateClientId, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where: { clientId: req.params.id },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching client audit logs:', error);
    res.status(500).json({
      error: 'Failed to fetch audit logs',
      code: 'FETCH_AUDIT_LOGS_ERROR'
    });
  }
});

// Update client information
router.put('/:id', authenticateToken, validateClientId, sanitizeInput, async (req, res) => {
  try {
    const { name, email, company } = req.body;
    
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Update allowed fields
    if (name) client.name = name;
    if (email) client.email = email;
    if (company !== undefined) client.company = company;
    
    await client.save();

    // Log update
    await AuditLog.create({
      clientId: client.id,
      action: 'client_updated',
      success: true,
      details: { name, email, company }
    });

    logger.info(`Client ${client.id} updated successfully`);
    
    res.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        gmailAddress: client.gmailAddress
      }
    });
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({
      error: 'Failed to update client',
      code: 'UPDATE_CLIENT_ERROR'
    });
  }
});

// Get client statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const totalClients = await Client.count();
    const activeClients = await Client.count({
      where: { registrationStatus: 'completed' }
    });
    const pendingClients = await Client.count({
      where: { registrationStatus: 'pending' }
    });
    const failedClients = await Client.count({
      where: { registrationStatus: 'failed' }
    });

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await Client.count({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    // Webhook delivery stats
    const webhookDelivered = await Client.count({
      where: { webhookDelivered: true }
    });

    res.json({
      totalClients,
      activeClients,
      pendingClients,
      failedClients,
      recentRegistrations,
      webhookDeliveryRate: totalClients > 0 ? (webhookDelivered / totalClients * 100).toFixed(2) : 0
    });
  } catch (error) {
    logger.error('Error fetching client statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      code: 'FETCH_STATS_ERROR'
    });
  }
});

// Search clients
router.get('/search/:query', authenticateToken, sanitizeInput, validatePagination, async (req, res) => {
  try {
    const query = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: clients } = await Client.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { company: { [Op.iLike]: `%${query}%` } },
          { gmailAddress: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'name', 'email', 'company', 'gmailAddress',
        'registrationStatus', 'createdAt'
      ]
    });

    res.json({
      clients,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error searching clients:', error);
    res.status(500).json({
      error: 'Failed to search clients',
      code: 'SEARCH_CLIENTS_ERROR'
    });
  }
});

module.exports = router;