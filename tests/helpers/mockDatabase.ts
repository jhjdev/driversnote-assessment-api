// Mock the mongodb utility module
export function mockMongoDBModule(): void {
  jest.doMock('../../src/utils/mongodb', () => ({
    connectToMongoDB: jest.fn().mockResolvedValue(undefined),
    closeMongoDB: jest.fn().mockResolvedValue(undefined),
    getDatabase: jest.fn(() => ({
      collection: jest.fn(() => ({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
          limit: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
        }),
        findOne: jest.fn().mockResolvedValue(null),
        insertOne: jest.fn().mockResolvedValue({
          insertedId: '507f1f77bcf86cd799439011',
          acknowledged: true
        }),
        updateOne: jest.fn().mockResolvedValue({
          matchedCount: 0,
          modifiedCount: 0,
          acknowledged: true,
          upsertedCount: 0,
          upsertedId: null
        }),
        deleteOne: jest.fn().mockResolvedValue({
          deletedCount: 0,
          acknowledged: true
        }),
        countDocuments: jest.fn().mockResolvedValue(0)
      }))
    })),
    isConnected: jest.fn().mockReturnValue(true),
  }));
}
