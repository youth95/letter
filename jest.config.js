module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage:true,
  setupFiles: ["jest-canvas-mock"],
};