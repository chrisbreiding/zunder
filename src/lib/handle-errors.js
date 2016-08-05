'use strict'

const notify = require('gulp-notify')

module.exports = (type = 'Error', condition = () => true) => (err) => {
  if (!condition(err)) return

  return notify.onError({
    title: type,
    message: "<%= error.message %>",
  })(err)
}
