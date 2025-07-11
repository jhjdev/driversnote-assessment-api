import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

interface AuthPluginOptions {
  allowedIPs?: string[];
  enableIPWhitelist?: boolean;
}

// Define routes that don't require authentication
const publicRoutes = ['/', '/api/health', '/docs', '/documentation'];

// Default allowed IPs (can be overridden via environment or options)
const DEFAULT_ALLOWED_IPS = [
  '127.0.0.1',
  '::1',
  'localhost'
];

// Function to check if IP is allowed
function isIPAllowed(clientIP: string, allowedIPs: string[]): boolean {
  if (!allowedIPs || allowedIPs.length === 0) {
    return true;
  }
  
  return allowedIPs.includes(clientIP) || 
         allowedIPs.includes('0.0.0.0') || // Allow all if 0.0.0.0 is in list
         clientIP === '127.0.0.1' || 
         clientIP === '::1';
}

// Function to get client IP
function getClientIP(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for'] as string;
  const realIP = request.headers['x-real-ip'] as string;
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.socket.remoteAddress || 'unknown';
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync<AuthPluginOptions> = async (
  fastify: FastifyInstance,
  options
) => {
  const allowedIPs = options?.allowedIPs || 
    (process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',').map(ip => ip.trim()) : DEFAULT_ALLOWED_IPS);
  
  const enableIPWhitelist = options?.enableIPWhitelist ?? 
    (process.env.ENABLE_IP_WHITELIST === 'true');

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const isPublicRoute = publicRoutes.some(route => 
      request.url.startsWith(route)
    );

    // Skip authentication for public routes
    if (isPublicRoute) {
      return;
    }

    // Check IP whitelist if enabled
    if (enableIPWhitelist) {
      const clientIP = getClientIP(request);
      
      if (!isIPAllowed(clientIP, allowedIPs)) {
        fastify.log.warn(`Access denied for IP: ${clientIP}`);
        reply.code(403).send({
          error: 'Access denied',
          message: 'Your IP address is not authorized to access this API'
        });
        return;
      }
    }

    const apiKey = request.headers['x-api-key'] as string;
    
    if (!apiKey) {
      reply.code(401).send({
        error: 'API key is required',
        message: 'Please provide a valid API key in the X-API-Key header'
      });
      return;
    }

    const expectedApiKey = process.env['API_KEY'];
    
    if (!expectedApiKey) {
      reply.code(500).send({
        error: 'Server configuration error',
        message: 'API key not configured on server'
      });
      return;
    }

    if (apiKey !== expectedApiKey) {
      fastify.log.warn(`Invalid API key attempt from IP: ${getClientIP(request)}`);
      reply.code(401).send({
        error: 'Invalid API key',
        message: 'The provided API key is invalid'
      });
      return;
    }

    // Log successful authentication for monitoring
    fastify.log.info(`Successful authentication from IP: ${getClientIP(request)}`);
  });
};

export default fp(authPlugin, {
  name: 'auth-plugin',
  fastify: '>=4.0.0'
});
