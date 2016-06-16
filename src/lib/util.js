const colors = require('chalk');
const { linefeed, PluginError, replaceExtension } = require('gulp-util');

function log (...args) {
  console.log(...args); // eslint-disable-line no-console
}

function logTask (message) {
  log(colors.cyan(message));
}

function logSubTask (message) {
  log(colors.blue(message));
}

function logError (error, ...args) {
  log(colors.red(error), ...args);
}

module.exports = {
  colors,
  log,
  logError,
  logSubTask,
  logTask,
  linefeed,
  PluginError,
  replaceExtension,
};
