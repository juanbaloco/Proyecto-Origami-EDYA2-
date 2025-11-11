/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.js'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@api$': '<rootDir>/src/api.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/test/styleMock.js',
  },

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    ],
  },

  // deja sin transformar solo node_modules “grandes”; permitimos @testing-library
  transformIgnorePatterns: ['/node_modules/(?!(uuid|@testing-library)/)'],

  moduleFileExtensions: ['js', 'jsx', 'json'],
};
