module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  "reporters": [ "default", "jest-junit" ],
  collectCoverage: true,
  testEnvironmentOptions: { "resources": "usable" },
  setupFiles: ["jest-canvas-mock"],
};