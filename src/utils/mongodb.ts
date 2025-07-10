import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export interface MongoConfig {
  uri: string;
  dbName: string;
}

export async function connectToMongoDB(config: MongoConfig): Promise<Db> {
  try {
    if (!config.uri) {
      throw new Error('MongoDB URI is required');
    }

    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(config.uri);
    await client.connect();
    db = client.db(config.dbName);

    console.log(`✅ Connected to MongoDB database: ${config.dbName}`);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectToMongoDB first.');
  }
  return db;
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    console.log('🔌 Closing MongoDB connection...');
    await client.close();
  }
}

export function isConnected(): boolean {
  return !!db;
}
