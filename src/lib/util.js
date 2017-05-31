const colors = require('chalk')
const fancyLog = require('fancy-log')
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

function logTask (message) {
  fancyLog(colors.cyan(message))
}

function logSubTask (message) {
  fancyLog(colors.blue(`• ${message}`))
}

function logAction (...args) {
  fancyLog(colors.grey('‣'), ...args)
}

function logActionStart (...args) {
  fancyLog(colors.grey('○'), ...args)
}

function logActionEnd (...args) {
  fancyLog(colors.grey('⦿'), ...args)
}

function logError (error, ...args) {
  fancyLog.error(colors.red(error), ...args)
}

module.exports = {
  colors,
  fileExists,
  log: fancyLog,
  logAction,
  logActionStart,
  logActionEnd,
  logError,
  logSubTask,
  logTask,
  linefeed,
  PluginError,
  replaceExtension,
}
