const instance = require('./instance')

const emit = (event) => (cb) => {
  instance.emit(event);
  cb()
}

module.exports = {
  emit,
}
