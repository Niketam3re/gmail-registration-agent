const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple session storage
const sessions = {};

// Google OAuth Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `https://gmail-registration-agent-production.up.railway.app/auth/google/callback`
);

// Home Page with Registration Form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Gmail Agent Registration</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
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
        .google-btn:hover {
          background: #f8f8f8;
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
app.post('/register', (req, res) => {
  const { name, email, company } = req.body;
  
  // Create session
  const sessionId = uuidv4();
  sessions[sessionId] = { name, email, company };
  
  // Redirect to Google OAuth with session ID
  res.redirect(`/auth/google?session=${sessionId}`);
});

// Start OAuth flow
app.get('/auth/google', (req, res) => {
  const sessionId = req.query.session || uuidv4();
  
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
    prompt: 'consent',
    state: sessionId
  });

  res.redirect(url);
});

// OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;

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

    // Get session data if exists
    const sessionData = sessions[state] || {};
    delete sessions[state];

    // Save to Supabase using API
    const { data: user, error } = await supabase
      .from('users')
      .upsert({
        email: sessionData.email || data.email,
        name: sessionData.name || data.name,
        company: sessionData.company || '',
        gmail_address: data.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: new Date(tokens.expiry_date).toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (error) throw error;

    // Success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registration Successful</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .success-box {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
            width: 100%;
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
            color: white;
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
          button:hover {
            background: #5a67d8;
          }
        </style>
      </head>
      <body>
        <div class="success-box">
          <div class="success-icon">✓</div>
          <h1>Registration Successful!</h1>
          <p>Gmail account connected successfully</p>
          <div class="email">${data.email}</div>
          <p>Your Gmail agent is now active.</p>
          <button onclick="window.location.href='/dashboard'">Go to Dashboard</button>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('OAuth/Database error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registration Failed</title>
        <style>
          body {
            font-family: -apple-system, sans-serif;
            background: #ef4444;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .error-box {
            max-width: 500px;
            margin: 50px auto;
          }
          button {
            background: white;
            color: #ef4444;
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="error-box">
          <h1>Registration Failed</h1>
          <p>Error: ${error.message}</p>
          <button onclick="window.location.href='/'">Try Again</button>
        </div>
      </body>
      </html>
    `);
  }
});

// Dashboard
app.get('/dashboard', async (req, res) => {
  try {
    // Get user count
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get recent users
    const { data: recentUsers } = await supabase
      .from('users')
      .select('email, name, company, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const userRows = recentUsers ? recentUsers.map(user => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${user.name || 'N/A'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${user.email}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${user.company || 'N/A'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${new Date(user.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('') : '';

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, sans-serif;
            background: #f3f4f6;
            padding: 20px;
            margin: 0;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 { 
            color: #333; 
            margin-bottom: 30px;
          }
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
          .table-container {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            text-align: left;
            padding: 12px;
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
          }
          .back-link {
            display: inline-block;
            margin-top: 20px;
            color: #667eea;
            text-decoration: none;
          }
          .back-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Gmail Agent Dashboard</h1>
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${count || 0}</div>
              <div class="stat-label">Registered Users</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">Active</div>
              <div class="stat-label">System Status</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${Math.floor(process.uptime() / 60)}m</div>
              <div class="stat-label">Uptime</div>
            </div>
          </div>
          
          ${count > 0 ? `
            <div class="table-container">
              <h2>Recent Registrations</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  ${userRows}
                </tbody>
              </table>
            </div>
          ` : '<p>No users registered yet.</p>'}
          
          <a href="/" class="back-link">← Back to Registration</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Dashboard error');
  }
});

// API endpoint
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, company, gmail_address, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      count: data.length,
      users: data
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (!error) dbStatus = 'connected';
  } catch (error) {
    console.error('Health check error:', error);
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    supabase: !!process.env.SUPABASE_URL,
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 OAuth configured: ${process.env.GOOGLE_CLIENT_ID ? 'Yes' : 'No'}`);
  console.log(`💾 Supabase configured: ${process.env.SUPABASE_URL ? 'Yes' : 'No'}`);
});
