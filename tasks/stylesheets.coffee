gulp = require 'gulp'
watch = require 'gulp-watch'
plumber = require 'gulp-plumber'
stylus = require 'gulp-stylus'
minify = require 'gulp-minify-css'
rev = require 'gulp-rev'
rename = require 'gulp-rename'
handleErrors = require '../lib/handle-errors'

module.exports = (config)->

  gulp.task "#{config.prefix}watch-stylesheets", ->
    watch glob: 'app/**/*.styl', ->
      gulp.src 'app/app.styl'
        .pipe plumber()
        .pipe stylus(errors: true).on('error', handleErrors)
        .pipe gulp.dest('./_dev/')
    return

  gulp.task "#{config.prefix}build-stylesheets", ["#{config.prefix}clean"], ->
    gulp.src 'app/app.styl'
      .pipe stylus(errors: true).on('error', handleErrors)
      .pipe minify()
      .pipe rev()
      .pipe gulp.dest('./_build/')
      .pipe rev.manifest()
      .pipe rename('stylesheets-manifest.json')
      .pipe gulp.dest('./_build/')
