gutil = require 'gulp-util'
notify = require 'gulp-notify'

module.exports = (e)->
  gutil.log e

  notify.onError(
    title: 'Compile Error'
    message: "<%= error.message %>"
  ).apply @, Array.prototype.slice.call(arguments)

  @emit 'end'
