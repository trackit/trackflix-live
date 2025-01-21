/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.ts?$": ["ts-jest",{}],
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  modulePathIgnorePatterns: [
      "<rootDir>/backend/legacy/"
  ]
};
