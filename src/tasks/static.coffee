watch = require 'gulp-watch'
notifyChanged = require '../lib/notify-changed'
paths = require '../lib/paths'

module.exports = (gulp)->

  process = (file)->
    notifyChanged file if file
    gulp.src 'static/**/*'
      .pipe(gulp.dest paths.devDir)

  gulp.task 'watch-static', ->
    watch 'static/**/*', process
    process()

  gulp.task 'copy-static', ['clean-prod'], ->
    gulp.src('static/**/*').pipe(gulp.dest paths.prodDir)
