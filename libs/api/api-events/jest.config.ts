export default {
  displayName: 'api-events',
  preset: '../../../jest.preset.js',
  testEnvironment: 'allure-jest/node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  coverageDirectory: '../../../coverage/libs/api/api-events',
  coverageReporters: ['json'],
  coverageProvider: 'babel',
};
