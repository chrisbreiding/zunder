gutil = require 'gulp-util'
notify = require 'gulp-notify'

module.exports = (err)->
  gutil.log gutil.colors.red err.toString()

  notify.onError(
    title: 'Compile Error'
    message: "<%= error.message %>"
  ).apply @, Array.prototype.slice.call(arguments)

  @emit 'end'
