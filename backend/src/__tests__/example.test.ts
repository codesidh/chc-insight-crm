/**
 * Example test file to verify Jest configuration
 */

describe('Development Tooling', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should support TypeScript', () => {
    const message: string = 'Hello, TypeScript!';
    expect(message).toBe('Hello, TypeScript!');
  });

  it('should support path aliases', async () => {
    // This test verifies that Jest can resolve path aliases
    // We'll import from the config directory using the @ alias
    const config = (await import('@/config/environment')).default;
    expect(config).toBeDefined();
    expect(config.nodeEnv).toBeDefined();
  });
});
