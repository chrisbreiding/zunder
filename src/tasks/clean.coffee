rimraf = require 'gulp-rimraf'

module.exports = (gulp, config)->

  gulp.task "#{config.prefix}clean-dev", ->
    gulp.src(config.devDir, read: false).pipe rimraf()

  gulp.task "#{config.prefix}clean-prod", ->
    gulp.src(config.prodDir, read: false).pipe rimraf()

  gulp.task "#{config.prefix}clean", ["#{config.prefix}clean-dev", "#{config.prefix}clean-prod"]
