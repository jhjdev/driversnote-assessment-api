import * as dotenv from 'dotenv';
import { mockMongoDBModule } from './helpers/mockDatabase';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
process.env.MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'driversnote_test';
process.env.API_KEY = process.env.API_KEY || 'test-api-key-12345';
process.env.PORT = process.env.PORT || '0'; // Use random port for tests

// Mock database
mockMongoDBModule();

// Mock console.log in tests to reduce noise
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: console.error, // Keep error logging for debugging
  };
}
