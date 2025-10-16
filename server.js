require('dotenv').config();
const express = require('express');
const path = require('path');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow Railway preview domains and production domains
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      process.env.RAILWAY_PUBLIC_DOMAIN,
      /^https:\/\/.*\.railway\.app$/,
      /^https:\/\/.*\.up\.railway\.app$/
    ].filter(Boolean);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    callback(null, isAllowed);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Configuration
// Railway assigns PORT automatically, fallback to 3001 for local dev
const PORT = parseInt(process.env.PORT) || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// OAuth2 Configuration
const getRedirectUri = () => {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/auth/google/callback`;
  }
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback';
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  getRedirectUri()
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify'
];

// ==================== ROUTES ====================

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    config: {
      supabase: !!SUPABASE_URL,
      oauth: !!process.env.GOOGLE_CLIENT_ID,
      n8n: !!N8N_WEBHOOK_URL
    }
  });
});

// Home Page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Enregistrement Agent Gmail</title>
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
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 500px;
          width: 100%;
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
          font-size: 28px;
        }
        p {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        label {
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
        }
        input {
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
          padding: 15px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        .permissions {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .permissions h3 {
          font-size: 14px;
          margin-bottom: 10px;
          color: #666;
        }
        .permissions ul {
          list-style: none;
          padding-left: 0;
        }
        .permissions li {
          padding: 5px 0;
          color: #666;
          font-size: 14px;
        }
        .permissions li:before {
          content: "✓ ";
          color: #4caf50;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Enregistrement Agent Gmail</h1>
        <p>Enregistrez votre compte Gmail pour permettre à l'agent d'accéder à vos emails.</p>
        
        <form action="/register" method="POST">
          <div class="form-group">
            <label for="name">Nom complet *</label>
            <input type="text" id="name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="email">Email de contact *</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="company">Entreprise</label>
            <input type="text" id="company" name="company">
          </div>
          
          <button type="submit">Connecter mon Gmail →</button>
        </form>
        
        <div class="permissions">
          <h3>Permissions Gmail requises :</h3>
          <ul>
            <li>Lecture de tous les emails</li>
            <li>Envoi d'emails</li>
            <li>Création de brouillons</li>
            <li>Modification d'emails</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Register - Store user info and start OAuth
app.post('/register', async (req, res) => {
  try {
    const { name, email, company } = req.body;

    // Store temporary user data in session (or use a temporary table)
    const tempUserId = Date.now().toString();
    
    // Generate OAuth URL with state parameter
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: JSON.stringify({ tempUserId, name, email, company })
    });

    res.redirect(authUrl);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Erreur lors de l\'enregistrement');
  }
});

// OAuth Callback
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    // Validate parameters
    if (!code) {
      throw new Error('Code de vérification manquant');
    }
    
    if (!state) {
      throw new Error('Données utilisateur manquantes');
    }

    // Parse user data from state
    let userData;
    try {
      userData = JSON.parse(state);
    } catch (parseError) {
      console.error('State parsing error:', state);
      throw new Error('Format de données invalide');
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user's Gmail address
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    // Store in Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: userData.name,
          email: userData.email,
          company: userData.company,
          gmail_address: profile.data.emailAddress,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: new Date(tokens.expiry_date).toISOString(),
          scopes: SCOPES.join(',')
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Setup Gmail Watch
    await setupGmailWatch(oauth2Client, data.id);

    // Send to n8n webhook
    if (N8N_WEBHOOK_URL) {
      await axios.post(N8N_WEBHOOK_URL, {
        userId: data.id,
        name: data.name,
        email: data.email,
        company: data.company,
        gmailAddress: data.gmail_address,
        registeredAt: data.created_at
      });
    }

    // Success page
    res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Enregistrement Réussi</title>
        <style>
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
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            text-align: center;
          }
          .success-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 { color: #4caf50; margin-bottom: 10px; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Enregistrement Réussi !</h1>
          <p>Votre compte Gmail <strong>${profile.data.emailAddress}</strong> a été connecté avec succès.</p>
          <p>L'agent peut maintenant accéder à vos emails.</p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    // Error page
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erreur d'authentification</title>
        <style>
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
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            text-align: center;
          }
          .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 { color: #f44336; margin-bottom: 10px; }
          p { color: #666; line-height: 1.6; margin-bottom: 20px; }
          .error-details {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            color: #666;
            text-align: left;
          }
          a {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">❌</div>
          <h1>Erreur d'authentification</h1>
          <p>Une erreur s'est produite lors de la connexion à votre compte Gmail.</p>
          <div class="error-details">
            ${error.message || 'Erreur inconnue'}
          </div>
          <a href="/">← Réessayer</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Setup Gmail Watch
async function setupGmailWatch(authClient, userId) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: authClient });
    
    const watchResponse = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'],
        topicName: process.env.PUBSUB_TOPIC || 'projects/your-project/topics/gmail-push'
      }
    });

    // Store watch details in Supabase
    await supabase
      .from('users')
      .update({
        watch_history_id: watchResponse.data.historyId,
        watch_expiration: new Date(parseInt(watchResponse.data.expiration)).toISOString()
      })
      .eq('id', userId);

    console.log('Gmail watch setup successful for user:', userId);
  } catch (error) {
    console.error('Gmail watch setup error:', error);
  }
}

// API: Get all registered users
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, company, gmail_address, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, users: data });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// ==================== SERVER STARTUP ====================

let server;

const startServer = (port) => {
  server = app.listen(port, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 Server running successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Port: ${port}`);
    console.log(`🌐 Local: http://localhost:${port}`);
    console.log(`🔗 Network: http://0.0.0.0:${port}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Configuration:');
    console.log(`   🔑 OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅' : '❌'}`);
    console.log(`   💾 Supabase: ${SUPABASE_URL ? '✅' : '❌'}`);
    console.log(`   🔗 n8n Webhook: ${N8N_WEBHOOK_URL ? '✅' : '❌'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  });

  // Handle port already in use error
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is busy, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n📛 Received ${signal}, closing server gracefully...`);
  
  if (server) {
    server.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('⚠️  Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled Rejection:', error);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer(PORT);
