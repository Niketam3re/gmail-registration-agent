const { google } = require('googleapis');
const logger = require('../config/logger');

class OAuthService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    this.scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];
  }

  getAuthUrl(state) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      state: state,
      prompt: 'consent' // Force consent screen to get refresh token
    });
  }

  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      // Get user info to verify the account
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date),
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture
      };
    } catch (error) {
      logger.error('Error getting OAuth tokens:', error);
      throw new Error('Failed to get OAuth tokens');
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });
      
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return {
        accessToken: credentials.access_token,
        expiryDate: new Date(credentials.expiry_date)
      };
    } catch (error) {
      logger.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  async revokeToken(token) {
    try {
      await this.oauth2Client.revokeToken(token);
      logger.info('Token revoked successfully');
    } catch (error) {
      logger.error('Error revoking token:', error);
      throw new Error('Failed to revoke token');
    }
  }

  async testConnection(accessToken) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });
      
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      
      return {
        email: profile.data.emailAddress,
        messagesTotal: profile.data.messagesTotal,
        threadsTotal: profile.data.threadsTotal
      };
    } catch (error) {
      logger.error('Error testing Gmail connection:', error);
      throw new Error('Failed to test Gmail connection');
    }
  }
}

module.exports = new OAuthService();