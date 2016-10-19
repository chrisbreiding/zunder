const util = require('./util')

const closeables = []

let exited = false
function handler (shouldExit, shouldErr = false, err) {
  if (exited) return

  exited = true

  closeables.forEach((closeable) => {
    if (typeof closeable.close === 'function') {
      closeable.close();
    }
  });

  if (err && err.stack) util.logError(err.stack)
  if (shouldExit) process.exit(shouldErr ? 1 : 0)
}

let eventsBound = false
function bindEvents () {
  if (eventsBound) return

  eventsBound = true

  process.once('exit', handler.bind(null, false, false))
  process.on('SIGINT', handler.bind(null, true, false))
  process.on('uncaughtException', handler.bind(null, true, true));
}

module.exports = {
  closeOnExit (closeable) {
    bindEvents()
    closeables.push(closeable);
  },
}
