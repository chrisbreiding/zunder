watch = require 'gulp-watch'

module.exports = (gulp, config)->

  process = ->
    gulp.src "#{config.staticDir}/**/*"
      .pipe(gulp.dest config.devDir)

  gulp.task "#{config.prefix}watch-static", ->
    watch "#{config.staticDir}/**/*", process
    process()

  gulp.task "#{config.prefix}copy-static", ["#{config.prefix}clean-prod"], ->
    gulp.src("#{config.staticDir}/**/*").pipe(gulp.dest config.prodDir)
