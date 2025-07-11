import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { getDatabase } from '../utils/mongodb';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  InitializeUsersRequest, 
  userSchema,
  createUserSchema
} from '../types';
import { RouteSchema } from '../types/swagger';

// Authentication function
async function authenticateRequest(request: FastifyRequest, reply: FastifyReply): Promise<boolean> {
  const apiKey = request.headers['x-api-key'] as string;
  
  if (!apiKey) {
    reply.code(401).send({
      error: 'API key is required',
      message: 'Please provide a valid API key in the X-API-Key header'
    });
    return false;
  }

  const expectedApiKey = process.env['API_KEY'];
  
  if (!expectedApiKey) {
    reply.code(500).send({
      error: 'Server configuration error',
      message: 'API key not configured on server'
    });
    return false;
  }

  if (apiKey !== expectedApiKey) {
    reply.code(401).send({
      error: 'Invalid API key',
      message: 'The provided API key is invalid'
    });
    return false;
  }

  return true;
}

const usersRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get all users (requires authentication)
  fastify.get('/users', {
    schema: {
      tags: ['Users'],
      description: 'Get all users',
      security: [{ apiKey: [] }],
      response: {
        200: {
          type: 'array',
          items: userSchema
        }
      }
    } satisfies RouteSchema
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Check authentication
    const isAuthenticated = await authenticateRequest(request, reply);
    if (!isAuthenticated) {
      return; // Response already sent by authenticateRequest
    }

    try {
      const db = getDatabase();
      const users = await db.collection<User>('users').find({}).toArray();
      console.log(`📋 Fetched ${users.length} users from MongoDB`);
      reply.send(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  });

  // Get user by ID (requires authentication)
  fastify.get('/users/:id', {
    schema: {
      tags: ['Users'],
      description: 'Get user by ID',
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: userSchema,
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    } satisfies RouteSchema
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Check authentication
    const isAuthenticated = await authenticateRequest(request, reply);
    if (!isAuthenticated) {
      return; // Response already sent by authenticateRequest
    }

    try {
      const userIdParam = (request.params as { id: string }).id;
      const userId = parseInt(userIdParam);
      
      if (isNaN(userId)) {
        reply.code(400).send({
          success: false,
          error: 'Invalid user ID'
        });
        return;
      }

      const db = getDatabase();
      const user = await db.collection<User>('users').findOne({ id: userId });

      if (!user) {
        reply.code(404).send({
          success: false,
          error: 'User not found'
        });
        return;
      }

      console.log(`👤 Fetched user: ${user.full_name}`);
      reply.send(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  });

  // Create new user
  fastify.post('/users', {
    schema: {
      tags: ['Users'],
      description: 'Create a new user',
      security: [{ apiKey: [] }],
      body: createUserSchema,
      response: {
        201: userSchema
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Check authentication
    const isAuthenticated = await authenticateRequest(request, reply);
    if (!isAuthenticated) {
      return; // Response already sent by authenticateRequest
    }

    try {
      const userData = request.body as CreateUserRequest;
      const db = getDatabase();

      // Generate new ID
      const maxUser = await db
        .collection<User>('users')
        .findOne({}, { sort: { id: -1 } });
      
      const newUser: User = {
        ...userData,
        id: (maxUser?.id || 0) + 1,
      };

      await db.collection<User>('users').insertOne(newUser);
      console.log(`➕ Created new user: ${newUser.full_name}`);
      
      reply.code(201).send(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to create user'
      });
    }
  });

  // Update user
  fastify.put('/users/:id', {
    schema: {
      tags: ['Users'],
      description: 'Update user by ID',
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          full_name: { type: 'string' },
          tag: { type: 'string' },
          address1: { type: 'string', nullable: true },
          address2: { type: 'string', nullable: true },
          postal_code: { type: ['number', 'string'], nullable: true },
          city: { type: 'string', nullable: true },
          country_name: { type: 'string' },
          country_id: { type: 'string' },
          organisation_id: { type: 'number', nullable: true }
        }
      },
      response: {
        200: userSchema,
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Check authentication
    const isAuthenticated = await authenticateRequest(request, reply);
    if (!isAuthenticated) {
      return; // Response already sent by authenticateRequest
    }

    try {
      const userIdParam = (request.params as { id: string }).id;
      const userId = parseInt(userIdParam);
      
      if (isNaN(userId)) {
        reply.code(400).send({
          success: false,
          error: 'Invalid user ID'
        });
        return;
      }

      const userData = request.body as UpdateUserRequest;
      const db = getDatabase();

      const result = await db
        .collection<User>('users')
        .updateOne({ id: userId }, { $set: userData });

      if (result.matchedCount === 0) {
        reply.code(404).send({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const updatedUser = await db
        .collection<User>('users')
        .findOne({ id: userId });
      
      console.log(`✏️ Updated user: ${updatedUser?.full_name}`);
      reply.send(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to update user'
      });
    }
  });

  // Delete user
  fastify.delete('/users/:id', {
    schema: {
      tags: ['Users'],
      description: 'Delete user by ID',
      security: [{ apiKey: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Check authentication
    const isAuthenticated = await authenticateRequest(request, reply);
    if (!isAuthenticated) {
      return; // Response already sent by authenticateRequest
    }

    try {
      const userIdParam = (request.params as { id: string }).id;
      const userId = parseInt(userIdParam);
      
      if (isNaN(userId)) {
        reply.code(400).send({
          success: false,
          error: 'Invalid user ID'
        });
        return;
      }

      const db = getDatabase();
      const result = await db
        .collection<User>('users')
        .deleteOne({ id: userId });

      if (result.deletedCount === 0) {
        reply.code(404).send({
          success: false,
          error: 'User not found'
        });
        return;
      }

      console.log(`🗑️ Deleted user with ID: ${userId}`);
      reply.send({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to delete user'
      });
    }
  });

  // Initialize users
  fastify.post('/users/initialize', {
    schema: {
      tags: ['Users'],
      description: 'Initialize users collection',
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: userSchema
          }
        },
        required: ['users']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Check authentication
    const isAuthenticated = await authenticateRequest(request, reply);
    if (!isAuthenticated) {
      return; // Response already sent by authenticateRequest
    }

    try {
      const { users } = request.body as InitializeUsersRequest;
      const db = getDatabase();

      // Check if users collection is empty
      const existingCount = await db.collection('users').countDocuments();

      if (existingCount === 0) {
        await db.collection<User>('users').insertMany(users);
        console.log(`🚀 Initialized ${users.length} users in MongoDB`);
        reply.send({
          success: true,
          message: `Initialized ${users.length} users`,
        });
      } else {
        console.log(`📊 Users collection already has ${existingCount} documents`);
        reply.send({
          success: true,
          message: `Collection already has ${existingCount} users`,
        });
      }
    } catch (error) {
      console.error('Error initializing users:', error);
      reply.code(500).send({
        success: false,
        message: 'Failed to initialize users',
        error: 'Failed to initialize users',
      });
    }
  });
};

export default usersRoutes;
