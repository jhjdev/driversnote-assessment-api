import { buildTestApp, getAuthHeaders, closeTestApp } from '../helpers/testApp';
import { FastifyInstance } from 'fastify';

describe('Users Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildTestApp();
  });

  afterEach(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/users', () => {
    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return users list with valid API key', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: getAuthHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(Array.isArray(payload)).toBe(true);
    });

    // Note: Pagination not implemented yet
    it('should return empty array when no users exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users',
        headers: getAuthHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(Array.isArray(payload)).toBe(true);
      expect(payload).toHaveLength(0);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/507f1f77bcf86cd799439011',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should validate MongoDB ObjectId format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/invalid-id',
        headers: getAuthHeaders(),
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toBe('Invalid user ID');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/1',
        headers: getAuthHeaders(),
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toBe('User not found');
      expect(payload.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    const validUser = {
      full_name: 'John Doe',
      tag: 'developer',
    };

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        payload: validUser,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: getAuthHeaders(),
        payload: {
          full_name: 'John Doe',
          // Missing tag
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should create user with valid data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users',
        headers: getAuthHeaders(),
        payload: validUser,
      });

      expect(response.statusCode).toBe(201);
      const payload = JSON.parse(response.payload);
      expect(payload.full_name).toBe(validUser.full_name);
      expect(payload.tag).toBe(validUser.tag);
      expect(payload.id).toBeDefined();
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/1',
        payload: { full_name: 'Updated Name' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should validate user ID format', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/invalid-id',
        headers: getAuthHeaders(),
        payload: { full_name: 'Updated Name' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/1',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should validate user ID format', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/users/invalid-id',
        headers: getAuthHeaders(),
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
