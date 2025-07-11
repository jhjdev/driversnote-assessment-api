import { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import authPlugin from '../../src/plugins/auth';
import usersRoutes from '../../src/routes/users';
import receiptsRoutes from '../../src/routes/receipts';

export async function buildTestApp(): Promise<FastifyInstance> {
  // Set test API key if not already set
  if (!process.env.API_KEY) {
    process.env.API_KEY = 'test-api-key-12345';
  }
  
  const fastify = Fastify({
    logger: false, // Disable logging in tests
  });

  // Register plugins
  await fastify.register(authPlugin);
  
  // Register routes
  await fastify.register(usersRoutes, { prefix: '/api' });
  await fastify.register(receiptsRoutes, { prefix: '/api' });

  // Health check endpoint
  fastify.get('/api/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'test',
    version: '1.0.0',
  }));

  return fastify;
}

export function getAuthHeaders(): Record<string, string> {
  return {
    'X-API-Key': process.env.API_KEY || 'test-api-key-12345',
  };
}

export async function closeTestApp(app: FastifyInstance): Promise<void> {
  await app.close();
}
