'use strict'

const notify = require('gulp-notify')
const util = require('../lib/util')

const errorsReported = {}

module.exports = {
  createTaskErrorHandler (type = 'Error', condition = () => true) {
    const handleTaskError = (err) => {
      if (!condition(err)) return

      return notify.onError({
        title: type,
        message: "<%= error.message %>",
      })(err)
    }

    return handleTaskError
  },

  handleUndertakerErrors (taker) {
    taker.on('error', ({ error }) => {
      // filter out duplicate errors
      if (errorsReported[error.message]) return

      errorsReported[error.message] = true

      util.logError('Unexpected error:')
      util.log(error.showStack === false ? `${error.plugin}: ${error.message}` : error.stack)
    })
  },
}
