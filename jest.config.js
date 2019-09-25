module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  "windowOptions": {
    "runScripts": "dangerously"
  },
  collectCoverage: true,
  testEnvironmentOptions: { "resources": "usable" },
  setupFiles: ["jest-canvas-mock"],
};