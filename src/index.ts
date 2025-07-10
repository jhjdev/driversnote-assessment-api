import Fastify from 'fastify';
import { FastifyInstance } from 'fastify';
import * as dotenv from 'dotenv';
import { connectToMongoDB, closeMongoDB, isConnected } from './utils/mongodb';
import authPlugin from './plugins/auth';
import usersRoutes from './routes/users';
import receiptsRoutes from './routes/receipts';
import { HealthCheckResponse } from './types';

// Load environment variables
dotenv.config();

// Create Fastify instance
const fastify: FastifyInstance = Fastify({
  logger: {
    level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'
  }
});

// Environment configuration
const config = {
  port: parseInt(process.env['PORT'] || '4000'),
  host: process.env['HOST'] || '0.0.0.0',
  mongoUri: process.env['MONGODB_URI'] || '',
  mongoDbName: process.env['MONGODB_DB_NAME'] || 'driversnote',
  corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  rateLimitMax: parseInt(process.env['RATE_LIMIT_MAX'] || '100'),
  rateLimitWindow: parseInt(process.env['RATE_LIMIT_WINDOW'] || '900000') // 15 minutes
};

async function buildApp(): Promise<FastifyInstance> {
  try {
    // Register security plugins
    await fastify.register(import('@fastify/helmet'), {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    });

    // Register CORS
    await fastify.register(import('@fastify/cors'), {
      origin: config.corsOrigin,
      credentials: true,
    });

    // Register rate limiting with stricter limits for production
    await fastify.register(import('@fastify/rate-limit'), {
      max: config.rateLimitMax,
      timeWindow: config.rateLimitWindow,
      skipOnError: false,
      ban: process.env.NODE_ENV === 'production' ? 10 : undefined, // Ban after 10 violations in production
      keyGenerator: (request) => {
        // Use IP address for rate limiting
        const forwarded = request.headers['x-forwarded-for'] as string;
        const realIP = request.headers['x-real-ip'] as string;
        
        if (forwarded) {
          return forwarded.split(',')[0].trim();
        }
        
        if (realIP) {
          return realIP;
        }
        
        return request.socket.remoteAddress || 'unknown';
      },
      errorResponseBuilder: (request, context) => {
        return {
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${context.max} per ${Math.round(context.ttl / 1000)} seconds`,
          retryAfter: Math.round(context.ttl / 1000)
        };
      }
    });

    // Register Swagger
    await fastify.register(import('@fastify/swagger'), {
      swagger: {
        info: {
          title: 'Driversnote Assessment API',
          description: 'API service for Driversnote assessment with MongoDB',
          version: '1.0.0',
        },
        host: `localhost:${config.port}`,
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        securityDefinitions: {
          apiKey: {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
          },
        },
        security: [{ apiKey: [] }],
      },
    });

    // Register Swagger UI
    await fastify.register(import('@fastify/swagger-ui'), {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject) => {
        return swaggerObject;
      },
      transformSpecificationClone: true,
    });

    // Register authentication plugin
    await fastify.register(authPlugin);

    // Health check endpoint (no authentication required)
    fastify.get('/api/health', {
      schema: {
        tags: ['Health'],
        description: 'Health check endpoint',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              database: { type: 'string' },
              version: { type: 'string' },
            },
          },
        },
      },
    }, async () => {
      const healthResponse: HealthCheckResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: isConnected() ? 'connected' : 'disconnected',
        version: process.env['npm_package_version'] || '1.0.0',
      };
      
      return healthResponse;
    });

    // Register API routes
    await fastify.register(usersRoutes, { prefix: '/api' });
    await fastify.register(receiptsRoutes, { prefix: '/api' });

    return fastify;
  } catch (error) {
    console.error('Error building app:', error);
    throw error;
  }
}

async function start(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectToMongoDB({
      uri: config.mongoUri,
      dbName: config.mongoDbName,
    });

    // Build the application
    const app = await buildApp();

    // Start the server
    await app.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`🚀 Server running on http://${config.host}:${config.port}`);
    console.log(`🏥 Health check: http://${config.host}:${config.port}/api/health`);
    console.log(`📚 API Documentation: http://${config.host}:${config.port}/docs`);
    console.log(`👥 Users API: http://${config.host}:${config.port}/api/users`);
    console.log(`🧾 Receipts API: http://${config.host}:${config.port}/api/receipts`);
    console.log(`🔐 API Key required for all endpoints except /api/health`);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
  
  try {
    await fastify.close();
    await closeMongoDB();
    console.log('✅ Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
start().catch(console.error);
