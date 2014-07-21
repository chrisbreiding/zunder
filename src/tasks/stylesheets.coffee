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
    watch glob: "#{config.srcDir}/**/*.styl", ->
      gulp.src "#{config.srcDir}/main.styl"
        .pipe plumber()
        .pipe stylus(errors: true).on('error', handleErrors)
        .pipe rename('app.css')
        .pipe gulp.dest(config.devDir)
    return

  gulp.task "#{config.prefix}build-stylesheets", ["#{config.prefix}clean"], ->
    gulp.src "#{config.srcDir}/main.styl"
      .pipe stylus(errors: true).on('error', handleErrors)
      .pipe minify()
      .pipe rename('app.css')
      .pipe rev()
      .pipe gulp.dest(config.prodDir)
      .pipe rev.manifest()
      .pipe rename('stylesheets-manifest.json')
      .pipe gulp.dest(config.prodDir)
