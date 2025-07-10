import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const apiKey = request.headers['x-api-key'] as string;
    
    if (!apiKey) {
      reply.code(401).send({
        success: false,
        error: 'API key is required',
        message: 'Please provide a valid API key in the X-API-Key header'
      });
      return;
    }

    const expectedApiKey = process.env['API_KEY'];
    
    if (!expectedApiKey) {
      reply.code(500).send({
        success: false,
        error: 'Server configuration error',
        message: 'API key not configured on server'
      });
      return;
    }

    if (apiKey !== expectedApiKey) {
      reply.code(401).send({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is invalid'
      });
      return;
    }
  });
};

export default fp(authPlugin, {
  name: 'auth-plugin'
});
