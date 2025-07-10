import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { getDatabase } from '../utils/mongodb';
import { 
  Receipt, 
  CreateReceiptRequest,
  receiptSchema,
  createReceiptSchema
} from '../types';
import { RouteSchema } from '../types/swagger';

const receiptsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get all receipts
  fastify.get('/receipts', {
    preHandler: fastify.authenticate,
    schema: {
      tags: ['Receipts'],
      description: 'Get all receipts',
      security: [{ apiKey: [] }],
      response: {
        200: {
          type: 'array',
          items: receiptSchema
        }
      }
    } satisfies RouteSchema
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const db = getDatabase();
      const receipts = await db
        .collection<Receipt>('receipts')
        .find({})
        .sort({ timestamp: -1 })
        .toArray();
      
      console.log(`📋 Fetched ${receipts.length} receipts from MongoDB`);
      reply.send(receipts);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch receipts'
      });
    }
  });

  // Create new receipt
  fastify.post('/receipts', {
    preHandler: fastify.authenticate,
    schema: {
      tags: ['Receipts'],
      description: 'Create a new receipt',
      security: [{ apiKey: [] }],
      body: createReceiptSchema,
      response: {
        201: receiptSchema
      }
    } satisfies RouteSchema
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const receiptData = request.body as CreateReceiptRequest;
      const db = getDatabase();

      const newReceipt: Receipt = {
        ...receiptData,
        id: new Date().getTime().toString(), // Simple ID generation
        timestamp: new Date().toISOString(),
      };

      await db.collection<Receipt>('receipts').insertOne(newReceipt);
      console.log(`🧾 Created new receipt for user: ${newReceipt.userName}`);
      
      reply.code(201).send(newReceipt);
    } catch (error) {
      console.error('Error creating receipt:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to create receipt'
      });
    }
  });

  // Delete receipt
  fastify.delete('/receipts/:id', {
    preHandler: fastify.authenticate,
    schema: {
      tags: ['Receipts'],
      description: 'Delete receipt by ID',
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
    } satisfies RouteSchema
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const receiptId = (request.params as { id: string }).id;
      const db = getDatabase();

      const result = await db
        .collection<Receipt>('receipts')
        .deleteOne({ id: receiptId });

      if (result.deletedCount === 0) {
        reply.code(404).send({
          success: false,
          error: 'Receipt not found'
        });
        return;
      }

      console.log(`🗑️ Deleted receipt with ID: ${receiptId}`);
      reply.send({ success: true });
    } catch (error) {
      console.error('Error deleting receipt:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to delete receipt'
      });
    }
  });
};

export default receiptsRoutes;
