const colors = require('chalk');
const { linefeed, PluginError, replaceExtension } = require('gulp-util');

function log (...args) {
  console.log(...args); // eslint-disable-line no-console
}

module.exports = {
  log,
  colors,
  linefeed,
  PluginError,
  replaceExtension,
};
