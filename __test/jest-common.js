const path = require('path');

module.exports = {
  rootDir: path.join(__dirname, '..'),
  watchPlugins: ['jest-watch-select-projects'],
  setupFiles: ['jest-date-mock', '<rootDir>/__test/jest-setup.js'],
};
