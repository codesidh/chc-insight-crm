// Jest setup file - runs after the test framework is installed
// This file is executed once per test file

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Database configuration for tests
process.env.TEST_DATABASE_HOST = 'localhost';
process.env.TEST_DATABASE_PORT = '5432';
process.env.TEST_DATABASE_NAME = 'chc_insight_test';
process.env.TEST_DATABASE_USERNAME = 'postgres';
process.env.TEST_DATABASE_PASSWORD = 'password';
process.env.TEST_DATABASE_SSL = 'false';

// Redis configuration for tests
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_DB = '1'; // Use different DB for tests

// JWT configuration for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '24h';

// Email configuration for tests (mock)
process.env.EMAIL_HOST = 'localhost';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_SECURE = 'false';
process.env.EMAIL_USERNAME = 'test@example.com';
process.env.EMAIL_PASSWORD = 'test-password';
process.env.EMAIL_FROM = 'test@chc-insight.com';

// File upload configuration for tests
process.env.FILE_UPLOAD_MAX_SIZE = '1048576'; // 1MB for tests
process.env.FILE_UPLOAD_PATH = './test-uploads';

// Increase timeout for database operations in tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Global test utilities
global.testUtils = {
  // Helper to restore console for specific tests
  restoreConsole: () => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  },

  // Helper to mock console again
  mockConsole: () => {
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  },

  // Helper to wait for async operations
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Helper to generate test data
  generateTestId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
};
