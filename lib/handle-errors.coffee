notify = require 'gulp-notify'

module.exports = ->

  notify.onError(
    title: 'Compile Error'
    message: "<%= error.message %>"
  ).apply @, Array.prototype.slice.call(arguments)

  @emit 'end'
