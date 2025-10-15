const oauthService = require('../../services/oauthService');

describe('OAuth Service', () => {
  describe('getAuthUrl', () => {
    it('should generate valid OAuth URL', () => {
      const state = 'test-state';
      const authUrl = oauthService.getAuthUrl(state);
      
      expect(authUrl).toContain('accounts.google.com');
      expect(authUrl).toContain('oauth');
      expect(authUrl).toContain('client_id');
      expect(authUrl).toContain('scope');
      expect(authUrl).toContain('state=' + state);
    });
  });

  describe('getTokens', () => {
    it('should throw error for invalid code', async () => {
      await expect(oauthService.getTokens('invalid-code'))
        .rejects
        .toThrow('Failed to get OAuth tokens');
    });
  });

  describe('refreshAccessToken', () => {
    it('should throw error for invalid refresh token', async () => {
      await expect(oauthService.refreshAccessToken('invalid-refresh-token'))
        .rejects
        .toThrow('Failed to refresh access token');
    });
  });

  describe('revokeToken', () => {
    it('should throw error for invalid token', async () => {
      await expect(oauthService.revokeToken('invalid-token'))
        .rejects
        .toThrow('Failed to revoke token');
    });
  });

  describe('testConnection', () => {
    it('should throw error for invalid access token', async () => {
      await expect(oauthService.testConnection('invalid-access-token'))
        .rejects
        .toThrow('Failed to test Gmail connection');
    });
  });
});