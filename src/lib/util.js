const colors = require('chalk')
const statSync = require('fs').statSync
const { linefeed, PluginError, replaceExtension } = require('gulp-util')

function fileExists (filePath) {
  try {
    statSync(filePath)
    return true
  } catch (e) {
    return false
  }
}

function log (...args) {
  console.log(...args) // eslint-disable-line no-console
}

function logTask (message) {
  log(colors.cyan(message))
}

function logSubTask (message) {
  log(colors.blue(message))
}

function logError (error, ...args) {
  log(colors.red(error), ...args)
}

module.exports = {
  colors,
  fileExists,
  log,
  logError,
  logSubTask,
  logTask,
  linefeed,
  PluginError,
  replaceExtension,
}
