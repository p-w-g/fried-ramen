module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  verbose: true,
  coverageReporters: ['text', 'html'],
  collectCoverage: true,
  transform: {
    '^.+\\.svg$': '<rootDir>/svgTransform.js',
  },
};
