module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  clearMocks: true,
  resetMocks: true,
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/'],
  roots: ['<rootDir>/src']
}; 