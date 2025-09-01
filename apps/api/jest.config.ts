export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'allure-jest/node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  coverageDirectory: '../../coverage/apps/api',
  coverageReporters: ['text', 'lcov', 'html'],
};
