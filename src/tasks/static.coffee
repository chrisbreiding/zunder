gulp = require 'gulp'
watch = require 'gulp-watch'

module.exports = (config)->

  gulp.task "#{config.prefix}watch-static", ->
    watch(glob: 'static/**/*').pipe(gulp.dest config.devDir)
    return

  gulp.task "#{config.prefix}copy-static", ["#{config.prefix}clean"], ->
    gulp.src('static/**/*').pipe(gulp.dest config.prodDir)
