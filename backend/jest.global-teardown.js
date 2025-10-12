// Jest global teardown - runs once after all tests
module.exports = async () => {
  console.log('🧹 Cleaning up test environment...');

  // You can add global cleanup logic here, such as:
  // - Stopping test database containers
  // - Cleaning up test data
  // - Shutting down external services

  console.log('✅ Test environment cleanup complete');
};
