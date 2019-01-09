'use strict'

const notifier = require('node-notifier')
const path = require('path')

const util = require('../lib/util')

const errorsReported = {}

const logTaskError = (task, err) => {
  util.logError(`Error thrown by ${task} task:`)
  util.log(err.stack || err.message || err)
}

const createFatalErrorHandler = (task) => {
  const handleFatalError = (err) => {
    logTaskError(task, err)
    process.exit(1)
  }

  return handleFatalError
}

const createTaskErrorHandler = (task, condition = () => true) => {
  const handleTaskError = (err) => {
    if (!condition(err)) return

    logTaskError(task, err)

    if (!process.env.DISABLE_NOTIFIER) {
      notifier.notify({
        icon: path.join(__dirname, 'icon.png'),
        title: task,
        message: err.stack || err.message || err,
      })
    }
  }

  return handleTaskError
}

const handleUndertakerErrors = (taker) => {
  taker.on('error', ({ error }) => {
    // filter out duplicate errors
    if (errorsReported[error.message]) return

    errorsReported[error.message] = true

    util.logError('\nUnexpected error:\n')
    util.log(error.showStack === false ? `${error.plugin}: ${error.message}` : error.stack)

    process.exit(1)
  })
}

module.exports = {
  createFatalErrorHandler,
  createTaskErrorHandler,
  handleUndertakerErrors,
}
