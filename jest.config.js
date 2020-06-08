module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  verbose: true,
  coverageReporters: ['text', 'html'],
  collectCoverage: true,
  transform: {
    '^.+\\.svg$': '<rootDir>/svgTransform.js',
  },
};
