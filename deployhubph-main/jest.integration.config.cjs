module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.test.ts', '**/tests/integration/**/*.spec.ts'],
  setupFilesAfterEnv: [],
  testTimeout: 120000,
};
