# Railway Deployment Guide

This guide will help you deploy the Gmail Registration Agent to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. A Supabase project (for database)
3. Google OAuth credentials
4. n8n webhook URL (optional)

## Step 1: Prepare Your Environment

### 1.1 Set up Supabase
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create the required database table:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  gmail_address VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry TIMESTAMP,
  scopes TEXT,
  watch_history_id VARCHAR(255),
  watch_expiration TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 1.2 Set up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-app-name.railway.app/auth/google/callback`
   - `http://localhost:3001/auth/google/callback` (for local development)

### 1.3 Set up n8n (Optional)
1. Create a webhook URL in your n8n instance
2. Note the webhook URL for later configuration

## Step 2: Deploy to Railway

### 2.1 Create New Project
1. Log in to Railway
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select this repository

### 2.2 Configure Environment Variables
In your Railway project dashboard, go to Variables and add:

```bash
# Required
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional
N8N_WEBHOOK_URL=your_n8n_webhook_url
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key
SESSION_SECRET=your_session_secret_here
PUBSUB_TOPIC=projects/your-project/topics/gmail-push
```

### 2.3 Update Google OAuth Redirect URI
1. Get your Railway app URL from the project dashboard
2. Update the redirect URI in Google Cloud Console to:
   `https://your-app-name.railway.app/auth/google/callback`

### 2.4 Deploy
1. Railway will automatically detect the `Dockerfile` and `railway.json`
2. The deployment will build both frontend and backend
3. Your app will be available at `https://your-app-name.railway.app`

## Step 3: Verify Deployment

### 3.1 Health Check
Visit `https://your-app-name.railway.app/health` to verify the API is working.

### 3.2 Test Registration Flow
1. Visit your app URL
2. Fill out the registration form
3. Complete the Google OAuth flow
4. Verify the success page appears

### 3.3 Check Logs
In Railway dashboard, check the logs for any errors or issues.

## Configuration Details

### Environment Variables Explained

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` for Railway |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Your Supabase anon key |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `N8N_WEBHOOK_URL` | No | Webhook URL for n8n integration |
| `JWT_SECRET` | No | Secret for JWT tokens |
| `ENCRYPTION_KEY` | No | 32-character key for encryption |
| `SESSION_SECRET` | No | Secret for session management |
| `PUBSUB_TOPIC` | No | Google Pub/Sub topic for Gmail push notifications |

### CORS Configuration
The app automatically configures CORS to work with:
- Railway preview domains (`*.railway.app`)
- Your production domain
- Local development (`localhost:3000`)

### Port Configuration
Railway automatically assigns a port via the `PORT` environment variable. The app is configured to use this port.

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Verify the Dockerfile is correct
   - Check Railway build logs

2. **OAuth Redirect Issues**
   - Ensure redirect URI matches exactly in Google Console
   - Check that the Railway domain is correct

3. **Database Connection Issues**
   - Verify Supabase credentials are correct
   - Check that the database table exists

4. **CORS Issues**
   - Verify the domain is in the allowed origins
   - Check that CORS_ORIGIN is set correctly

### Getting Help

1. Check Railway logs in the dashboard
2. Verify environment variables are set correctly
3. Test the health endpoint
4. Check Google OAuth configuration

## Monitoring

Railway provides built-in monitoring:
- View logs in real-time
- Monitor resource usage
- Set up alerts for failures

## Scaling

Railway automatically handles scaling based on traffic. You can also:
- Set resource limits in the Railway dashboard
- Configure auto-scaling policies
- Monitor performance metrics

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to git
2. **HTTPS**: Railway provides HTTPS by default
3. **CORS**: Configured to only allow trusted domains
4. **Helmet**: Security headers are enabled
5. **OAuth**: Uses secure OAuth 2.0 flow

## Maintenance

1. **Updates**: Push to your main branch to trigger new deployments
2. **Database**: Monitor Supabase for storage and performance
3. **Logs**: Regularly check Railway logs for issues
4. **Dependencies**: Keep dependencies updated for security

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- Google OAuth Documentation: [developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)