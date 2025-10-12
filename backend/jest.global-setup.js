// Jest global setup - runs once before all tests
module.exports = async () => {
  console.log('🧪 Setting up test environment...');

  // Set global test environment variables
  process.env.NODE_ENV = 'test';

  // You can add global setup logic here, such as:
  // - Starting test database containers
  // - Setting up test data
  // - Initializing external services for testing

  console.log('✅ Test environment setup complete');
};
