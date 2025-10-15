const { google } = require('googleapis');
const logger = require('../config/logger');

class GmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  async createWatchSubscription(accessToken, gmailAddress) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // Create watch subscription
      const watchResponse = await gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: process.env.GOOGLE_PUBSUB_TOPIC || 'projects/your-project/topics/gmail-notifications',
          labelIds: ['INBOX'], // Watch INBOX by default
          labelFilterBehavior: 'include'
        }
      });

      logger.info(`Watch subscription created for ${gmailAddress}:`, watchResponse.data);

      return {
        historyId: watchResponse.data.historyId,
        expiration: new Date(parseInt(watchResponse.data.expiration))
      };
    } catch (error) {
      logger.error('Error creating Gmail watch subscription:', error);
      throw new Error('Failed to create Gmail watch subscription');
    }
  }

  async renewWatchSubscription(accessToken, gmailAddress) {
    try {
      // Gmail watch subscriptions auto-renew, but we can check status
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      // Get current watch status
      const watchResponse = await gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: process.env.GOOGLE_PUBSUB_TOPIC || 'projects/your-project/topics/gmail-notifications',
          labelIds: ['INBOX'],
          labelFilterBehavior: 'include'
        }
      });

      logger.info(`Watch subscription renewed for ${gmailAddress}:`, watchResponse.data);

      return {
        historyId: watchResponse.data.historyId,
        expiration: new Date(parseInt(watchResponse.data.expiration))
      };
    } catch (error) {
      logger.error('Error renewing Gmail watch subscription:', error);
      throw new Error('Failed to renew Gmail watch subscription');
    }
  }

  async stopWatchSubscription(accessToken) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      await gmail.users.stop({
        userId: 'me'
      });

      logger.info('Gmail watch subscription stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping Gmail watch subscription:', error);
      throw new Error('Failed to stop Gmail watch subscription');
    }
  }

  async getProfile(accessToken) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });

      return {
        emailAddress: profile.data.emailAddress,
        messagesTotal: profile.data.messagesTotal,
        threadsTotal: profile.data.threadsTotal,
        historyId: profile.data.historyId
      };
    } catch (error) {
      logger.error('Error getting Gmail profile:', error);
      throw new Error('Failed to get Gmail profile');
    }
  }

  async getMessages(accessToken, query = '', maxResults = 10) {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults
      });

      return response.data.messages || [];
    } catch (error) {
      logger.error('Error getting Gmail messages:', error);
      throw new Error('Failed to get Gmail messages');
    }
  }
}

module.exports = new GmailService();