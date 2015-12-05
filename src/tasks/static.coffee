watch = require 'gulp-watch'
notifyChanged = require '../lib/notify-changed'

module.exports = (gulp, config)->

  process = (file)->
    notifyChanged file if file
    gulp.src "#{config.staticDir}/**/*"
      .pipe(gulp.dest config.devDir)

  gulp.task "#{config.prefix}watch-static", ->
    watch "#{config.staticDir}/**/*", process
    process()

  gulp.task "#{config.prefix}copy-static", ["#{config.prefix}clean-prod"], ->
    gulp.src("#{config.staticDir}/**/*").pipe(gulp.dest config.prodDir)
