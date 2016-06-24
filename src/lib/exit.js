const util = require('./util')

const closeables = []

const handler = (shouldExit, err) => {
  closeables.forEach((closeable) => {
    if (typeof closeable.close === 'function') {
      closeable.close();
    }
  });

  if (err) util.logError(err)
  if (shouldExit) process.exit()
}

process.once('exit', handler)
process.on('SIGINT', handler.bind(null, true))
process.on('uncaughtException', handler.bind(null, true));

module.exports = {
  closeOnExit (closeable) {
    closeables.push(closeable);
  },
}
