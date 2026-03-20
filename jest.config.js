module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'auth-service/**/*.js',
    'target-service/**/*.js',
    'api-gateway/**/*.js',
    '!**/node_modules/**',
    '!**/app.js'
  ]
};
