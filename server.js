const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
const { Pool } = require('pg');
const redis = require('redis');
const RedisStore = require('connect-redis').default;
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Database Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Redis Setup
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});
redisClient.connect().catch(console.error);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Setup
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Google OAuth Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/auth/google/callback`
);

// Initialize Database Tables
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        company VARCHAR(255),
        gmail_address VARCHAR(255),
        access_token TEXT,
        refresh_token TEXT,
        token_expiry TIMESTAMP,
        watch_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize on startup
initDB();

// Routes

// Home Page with Registration Form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Gmail Agent Registration</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 500px;
          width: 100%;
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
          font-size: 28px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
        }
        input:focus {
          outline: none;
          border-color: #667eea;
        }
        button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 30px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: transform 0.2s;
        }
        button:hover {
          transform: translateY(-2px);
        }
        .google-btn {
          background: white;
          color: #333;
          border: 2px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }
        .divider {
          text-align: center;
          margin: 20px 0;
          color: #999;
        }
        .status {
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          display: inline-block;
          font-size: 14px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="status">✅ System Active</span>
        <h1>Gmail Agent Registration</h1>
        <p class="subtitle">Connect your Gmail to enable automated email processing</p>
        
        <form action="/register" method="POST">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="company">Company (Optional)</label>
            <input type="text" id="company" name="company">
          </div>
          
          <button type="submit">Register & Connect Gmail</button>
        </form>
        
        <div class="divider">— OR —</div>
        
        <button class="google-btn" onclick="window.location.href='/auth/google'">
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd"><path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"></path><path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"></path><path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"></path><path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"></path></g></svg>
          Quick Connect with Google
        </button>
      </div>
    </body>
    </html>
  `);
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { name, email, company } = req.body;
  
  // Store in session for after OAuth
  req.session.pendingUser = { name, email, company };
  
  // Redirect to Google OAuth
  res.redirect('/auth/google');
});

// Start OAuth flow
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.redirect(url);
});

// OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Prepare user data
    const userData = {
      email: req.session.pendingUser?.email || data.email,
      name: req.session.pendingUser?.name || data.name,
      company: req.session.pendingUser?.company || '',
      gmail_address: data.email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: new Date(tokens.expiry_date)
    };

    // Save to database
    await pool.query(`
      INSERT INTO users (email, name, company, gmail_address, access_token, refresh_token, token_expiry)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) 
      DO UPDATE SET 
        access_token = $5,
        refresh_token = $6,
        token_expiry = $7,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [userData.email, userData.name, userData.company, userData.gmail_address, 
        userData.access_token, userData.refresh_token, userData.token_expiry]);

    // Clear session
    req.session.pendingUser = null;

    // Success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registration Successful</title>
        <style>
          body {
            font-family: -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .success-box {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 40px;
          }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; margin-bottom: 20px; }
          .email { 
            background: #f3f4f6; 
            padding: 10px 20px; 
            border-radius: 8px; 
            font-family: monospace;
            margin: 20px 0;
          }
          button {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="success-box">
          <div class="success-icon">✓</div>
          <h1>Registration Successful!</h1>
          <p>Gmail account connected successfully</p>
          <div class="email">${data.email}</div>
          <p>Your Gmail agent is now active and monitoring your inbox.</p>
          <button onclick="window.location.href='/dashboard'">Go to Dashboard</button>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Authentication failed. Please try again.');
  }
});

// Dashboard
app.get('/dashboard', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = result.rows[0].count;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dashboard</title>
        <style>
          body {
            font-family: -apple-system, sans-serif;
            background: #f3f4f6;
            padding: 20px;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 { color: #333; }
          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .stat-card {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .stat-value {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
          }
          .stat-label {
            color: #666;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Gmail Agent Dashboard</h1>
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${userCount}</div>
              <div class="stat-label">Registered Users</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">Active</div>
              <div class="stat-label">System Status</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${process.uptime().toFixed(0)}s</div>
              <div class="stat-label">Uptime</div>
            </div>
          </div>
          <a href="/">← Back to Registration</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Dashboard error');
  }
});

// Health check
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (error) {
    console.error('DB health check failed:', error);
  }

  try {
    await redisClient.ping();
    redisStatus = 'connected';
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus
    },
    uptime: process.uptime()
  });
});

// API endpoint to get all users (for testing)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, company, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 OAuth Redirect URI: ${process.env.GOOGLE_REDIRECT_URI || 'Not configured'}`);
});
