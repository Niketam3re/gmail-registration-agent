# Gmail Agent Registration System

A complete Gmail agent registration system that allows clients to authorize Gmail access through a web interface, securely manages their credentials, integrates with external automation systems via webhooks, and automatically maintains Gmail watch subscriptions for real-time email monitoring.

## Features

### Core Functionality
- **Client Registration Portal** - Public-facing web interface with OAuth 2.0 flow
- **Credential Management** - Secure storage and automatic refresh of OAuth tokens
- **Integration Capabilities** - Webhook-based notifications for external systems
- **Gmail Monitoring** - Watch subscriptions for real-time email monitoring

### Security Features
- OAuth 2.0 authentication with Google
- Token encryption at rest using AES-256-GCM
- HTTPS/TLS for all communications
- Input validation and sanitization
- Rate limiting and CSRF protection
- Secure session handling

### Automation
- Automatic token refresh before expiration
- Gmail watch subscription renewal (every 6 hours)
- Webhook delivery with retry logic
- Comprehensive audit logging
- Background job processing

## Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** for data storage
- **Redis** for session management
- **Sequelize** ORM
- **Google APIs** for Gmail integration
- **JWT** for authentication
- **Winston** for logging

### Frontend
- **React** 18 with modern hooks
- **React Router** for navigation
- **Styled Components** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **Axios** for API calls

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+
- Google Cloud Console project with Gmail API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gmail-agent-registration
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gmail_agent_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
   
   # Security
   JWT_SECRET=your_jwt_secret
   ENCRYPTION_KEY=your_32_character_encryption_key
   SESSION_SECRET=your_session_secret
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3001/auth/google/callback`

5. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb gmail_agent_db
   
   # Run migrations
   npm run migrate
   
   # Seed with sample data (optional)
   npm run seed
   ```

6. **Start Redis server**
   ```bash
   redis-server
   ```

7. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or start individually
   npm run server:dev  # Backend only
   npm run client:dev  # Frontend only
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

## API Documentation

### Authentication Endpoints

#### `POST /api/auth/pre-register`
Pre-register a client with basic information.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "gmailAddress": "john.doe@gmail.com",
  "consentGiven": true
}
```

#### `GET /api/auth/google`
Get OAuth authorization URL.

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/oauth/authorize?...",
  "state": "unique-state-token"
}
```

#### `GET /api/auth/google/callback`
OAuth callback endpoint (handled automatically).

#### `POST /api/auth/revoke`
Revoke client access.

**Request Body:**
```json
{
  "clientId": "client-uuid"
}
```

### Client Management Endpoints

#### `GET /api/clients`
Get paginated list of clients.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### `GET /api/clients/:id`
Get specific client by ID.

#### `PUT /api/clients/:id`
Update client information.

#### `GET /api/clients/stats/overview`
Get client statistics.

#### `GET /api/clients/search/:query`
Search clients by name, email, or company.

### Webhook Endpoints

#### `POST /api/webhooks/receive`
Receive webhook notifications from external systems.

#### `GET /api/webhooks/status`
Get webhook service status.

#### `POST /api/webhooks/test`
Test webhook endpoint.

## Webhook Integration

The system sends webhooks to external systems for various events:

### Registration Webhook
```json
{
  "eventType": "registration",
  "clientId": "client-uuid",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "registrationData": {
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "gmailAddress": "john.doe@gmail.com"
    },
    "credentials": {
      "accessToken": "encrypted_access_token",
      "refreshToken": "encrypted_refresh_token",
      "expiryDate": "2024-01-02T00:00:00Z"
    },
    "metadata": {
      "registeredAt": "2024-01-01T00:00:00Z",
      "watchExpiration": "2024-01-08T00:00:00Z"
    }
  }
}
```

### Watch Renewal Webhook
```json
{
  "eventType": "watch_renewal",
  "clientId": "client-uuid",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "renewalData": {
      "newHistoryId": "12345",
      "newExpiration": "2024-01-08T00:00:00Z",
      "renewedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

## Database Schema

### Clients Table
- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `company` (String, Optional)
- `gmailAddress` (String, Unique)
- `accessToken` (Text, Encrypted)
- `refreshToken` (Text, Encrypted)
- `tokenExpiry` (DateTime)
- `watchTopic` (String, Optional)
- `watchExpiry` (DateTime, Optional)
- `watchHistoryId` (String, Optional)
- `registrationStatus` (Enum: pending, completed, failed, expired)
- `consentGiven` (Boolean)
- `consentDate` (DateTime, Optional)
- `webhookDelivered` (Boolean)
- `webhookDeliveredAt` (DateTime, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Audit Logs Table
- `id` (UUID, Primary Key)
- `clientId` (UUID, Foreign Key)
- `action` (Enum: registration_started, oauth_authorized, etc.)
- `details` (JSONB)
- `ipAddress` (Inet)
- `userAgent` (Text)
- `success` (Boolean)
- `errorMessage` (Text)
- `createdAt` (DateTime)

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database (use production values)
DB_HOST=your-production-db-host
DB_PASSWORD=your-production-password

# Redis (use production values)
REDIS_HOST=your-production-redis-host
REDIS_PASSWORD=your-production-redis-password

# Security (use strong, unique values)
JWT_SECRET=your-production-jwt-secret
ENCRYPTION_KEY=your-production-encryption-key
SESSION_SECRET=your-production-session-secret

# Google OAuth (use production values)
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback

# Webhook
WEBHOOK_BASE_URL=https://your-webhook-endpoint.com
WEBHOOK_SECRET=your-webhook-secret

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Security**: Use strong passwords and enable SSL
3. **Redis Security**: Use authentication and SSL in production
4. **HTTPS**: Always use HTTPS in production
5. **Token Security**: Rotate JWT secrets regularly
6. **Encryption Keys**: Use cryptographically secure random keys
7. **Rate Limiting**: Configure appropriate rate limits
8. **CORS**: Restrict CORS origins in production

## Monitoring and Logging

The system includes comprehensive logging and monitoring:

- **Winston Logger**: Structured logging with multiple levels
- **Audit Trail**: Complete audit log of all actions
- **Health Checks**: Built-in health check endpoint
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Metrics**: Request timing and performance monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Email: support@example.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

**Note**: This is a production-ready system designed for enterprise use. Make sure to review all security settings and configurations before deploying to production.