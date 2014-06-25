gulp = require 'gulp'
rimraf = require 'gulp-rimraf'

module.exports = (config)->

  gulp.task "#{config.prefix}clean", ->
    gulp.src(config.devDir, read: false).pipe rimraf()
    gulp.src(config.prodDir, read: false).pipe rimraf()
