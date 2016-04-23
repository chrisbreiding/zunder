del = require 'del'
paths = require '../lib/paths'

module.exports = (gulp)->

  gulp.task 'clean-dev', ->
    del paths.devDir

  gulp.task 'clean-prod', ->
    del paths.prodDir

  gulp.task 'clean', ['clean-dev', 'clean-prod']
