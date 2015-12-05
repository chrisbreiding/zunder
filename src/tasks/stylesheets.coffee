autoprefixer = require 'gulp-autoprefixer'
gutil = require 'gulp-util'
watch = require 'gulp-watch'
plumber = require 'gulp-plumber'
stylus = require 'gulp-stylus'
minify = require 'gulp-minify-css'
rev = require 'gulp-rev'
rename = require 'gulp-rename'
handleErrors = require '../lib/handle-errors'
notifyChanged = require '../lib/notify-changed'

module.exports = (gulp, config)->

  process = (file)->
    notifyChanged file if file
    gulp.src "#{config.srcDir}/main.styl"
      .pipe plumber(handleErrors)
      .pipe stylus()
      .pipe autoprefixer
        browsers: ['last 2 versions']
        cascade: false
      .pipe rename('app.css')
      .pipe gulp.dest(config.devDir)
      .on 'end', ->
        gutil.log gutil.colors.green 'Stylesheets re-compiled'

  gulp.task "#{config.prefix}watch-stylesheets", ->
    watch "#{config.srcDir}/**/*.styl", process
    process()

  gulp.task "#{config.prefix}build-stylesheets", ["#{config.prefix}clean-prod"], ->
    gulp.src "#{config.srcDir}/main.styl"
      .pipe plumber(handleErrors)
      .pipe stylus()
      .pipe autoprefixer
        browsers: ['last 2 versions']
        cascade: false
      .pipe minify()
      .pipe rename('app.css')
      .pipe rev()
      .pipe gulp.dest(config.prodDir)
      .pipe rev.manifest()
      .pipe rename('stylesheets-manifest.json')
      .pipe gulp.dest(config.prodDir)
