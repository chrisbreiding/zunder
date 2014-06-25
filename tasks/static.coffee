gulp = require 'gulp'
watch = require 'gulp-watch'

module.exports = (config)->

  gulp.task "#{config.prefix}watch-static", ->
    watch(glob: 'static/**/*').pipe(gulp.dest '_dev')
    return

  gulp.task "#{config.prefix}copy-static", ['clean'], ->
    gulp.src('static/**/*').pipe(gulp.dest '_build')
