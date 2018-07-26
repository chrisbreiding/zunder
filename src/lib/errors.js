'use strict'

const notify = require('gulp-notify')
const util = require('../lib/util')

const errorsReported = {}

module.exports = {
  createFatalErrorHandler (task) {
    const handleFatalError = (err) => {
      util.logError(`Error thrown by ${task} task:`)
      util.logError(err.stack || err)
      process.exit(1)
    }

    return handleFatalError
  },

  createTaskErrorHandler (type = 'Error', condition = () => true) {
    const handleTaskError = (err) => {
      if (!condition(err)) return

      return notify.onError({
        title: type,
        message: err.stack || err.message || err,
      })(err)
    }

    return handleTaskError
  },

  handleUndertakerErrors (taker) {
    taker.on('error', ({ error }) => {
      // filter out duplicate errors
      if (errorsReported[error.message]) return

      errorsReported[error.message] = true

      util.logError('\nUnexpected error:\n')
      util.log(error.showStack === false ? `${error.plugin}: ${error.message}` : error.stack)

      process.exit(1)
    })
  },
}
