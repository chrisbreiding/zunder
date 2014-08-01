watch = require 'gulp-watch'

module.exports = (gulp, config)->

  gulp.task "#{config.prefix}watch-static", ->
    watch(glob: "#{config.staticDir}/**/*").pipe(gulp.dest config.devDir)
    return

  gulp.task "#{config.prefix}copy-static", ["#{config.prefix}clean-prod"], ->
    gulp.src("#{config.staticDir}/**/*").pipe(gulp.dest config.prodDir)
