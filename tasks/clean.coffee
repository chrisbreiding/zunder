gulp = require 'gulp'
rimraf = require 'gulp-rimraf'

module.exports = (config)->

  gulp.task "#{config.prefix}clean", ->
    gulp.src('_dev', read: false).pipe rimraf()
    gulp.src('_build', read: false).pipe rimraf()
