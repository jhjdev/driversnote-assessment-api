import { buildTestApp, getAuthHeaders, closeTestApp } from '../helpers/testApp';
import { FastifyInstance } from 'fastify';

describe('Authentication Plugin', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildTestApp();
  });

  afterEach(async () => {
    await closeTestApp(app);
  });

  describe('API Key Authentication', () => {
    it('should allow access with valid API key', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: getAuthHeaders(),
      });

      expect(response.statusCode).not.toBe(401);
    });

    it('should reject requests without API key', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toBe('API key is required');
    });

    it('should reject requests with invalid API key', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: {
          'X-API-Key': 'invalid-key',
        },
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toBe('Invalid API key');
    });

    it('should allow access to health endpoint without API key', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.status).toBe('ok');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple requests within limit', async () => {
      const requests = Array.from({ length: 5 }, () =>
        app.inject({
          method: 'GET',
          url: '/api/health',
        })
      );

      const responses = await Promise.all(requests);
      responses.forEach((response) => {
        expect(response.statusCode).toBe(200);
      });
    });
  });
});
