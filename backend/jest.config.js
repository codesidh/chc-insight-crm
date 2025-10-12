module.exports = {
  // Test environment
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Root directory
  rootDir: './src',

  // Test file patterns
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],

  // Transform files
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/controllers/(.*)$': '<rootDir>/controllers/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/models/(.*)$': '<rootDir>/models/$1',
    '^@/middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/../jest.setup.js'],

  // Coverage configuration
  collectCoverage: false,
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/*.test.ts',
    '!**/*.spec.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/database/migrations/**',
    '!**/database/seeds/**',
    '!**/scripts/**',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },

  // Test timeout
  testTimeout: 30000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Error handling
  errorOnDeprecated: true,

  // Watch mode configuration
  watchPathIgnorePatterns: [
    '<rootDir>/../node_modules/',
    '<rootDir>/../dist/',
    '<rootDir>/../coverage/',
  ],

  // Global setup and teardown
  globalSetup: '<rootDir>/../jest.global-setup.js',
  globalTeardown: '<rootDir>/../jest.global-teardown.js',

  // TypeScript configuration
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'ES2022',
        module: 'commonjs',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true,
        baseUrl: './src',
        paths: {
          '@/*': ['*'],
          '@/controllers/*': ['controllers/*'],
          '@/services/*': ['services/*'],
          '@/models/*': ['models/*'],
          '@/middleware/*': ['middleware/*'],
          '@/utils/*': ['utils/*'],
          '@/config/*': ['config/*'],
          '@/types/*': ['types/*'],
        },
      },
    },
  },
};
