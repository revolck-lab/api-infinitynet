/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
      '**/*.(t|j)s',
      '!**/*.d.ts',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/coverage/**',
    ],
    coverageDirectory: './coverage',
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
    ],
    setupFiles: ['./jest.setup.js'],
  };