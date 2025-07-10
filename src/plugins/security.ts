import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

interface SecurityPluginOptions {
  enableRequestLogging?: boolean;
  maxRequestSize?: number;
}

const securityPlugin: FastifyPluginAsync<SecurityPluginOptions> = async (
  fastify: FastifyInstance,
  options
) => {
  const enableRequestLogging = options?.enableRequestLogging ?? 
    (process.env.NODE_ENV === 'production');
  
  const maxRequestSize = options?.maxRequestSize ?? 1048576; // 1MB default

  // Request size limiting
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const contentLength = request.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > maxRequestSize) {
      reply.code(413).send({
        error: 'Payload too large',
        message: `Request body cannot exceed ${maxRequestSize} bytes`
      });
      return;
    }
  });

  // Security headers and request logging
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
    // Add security headers
    reply.headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });

    // Remove server information
    reply.removeHeader('X-Powered-By');
    reply.removeHeader('Server');

    // Log requests in production for monitoring
    if (enableRequestLogging) {
      const clientIP = getClientIP(request);
      const userAgent = request.headers['user-agent'] || 'unknown';
      
      fastify.log.info({
        method: request.method,
        url: request.url,
        ip: clientIP,
        userAgent: userAgent,
        statusCode: reply.statusCode,
        responseTime: reply.getResponseTime()
      }, 'Request processed');
    }

    return payload;
  });

  // Block suspicious requests
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const userAgent = request.headers['user-agent'] || '';
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i
    ];

    // Block obvious bots (except for health checks)
    if (request.url !== '/api/health' && 
        process.env.NODE_ENV === 'production' &&
        suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      
      fastify.log.warn(`Blocked suspicious user agent: ${userAgent} from IP: ${getClientIP(request)}`);
      reply.code(403).send({
        error: 'Access denied',
        message: 'Automated requests are not allowed'
      });
      return;
    }

    // Block requests with suspicious content
    const url = request.url.toLowerCase();
    const suspiciousURLPatterns = [
      /\.\./,  // Path traversal
      /script/i,  // Script injection attempts
      /eval/i,    // Code injection attempts
      /union.*select/i,  // SQL injection attempts
      /alert\(/i,  // XSS attempts
    ];

    if (suspiciousURLPatterns.some(pattern => pattern.test(url))) {
      fastify.log.warn(`Blocked suspicious URL: ${request.url} from IP: ${getClientIP(request)}`);
      reply.code(400).send({
        error: 'Bad request',
        message: 'Invalid request format'
      });
      return;
    }
  });
};

// Helper function to get client IP (reused from auth plugin)
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

export default fp(securityPlugin, {
  name: 'security-plugin'
});
