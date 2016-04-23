autoprefixer = require 'gulp-autoprefixer'
gutil = require 'gulp-util'
watch = require 'gulp-watch'
plumber = require 'gulp-plumber'
stylus = require 'gulp-stylus'
minify = require 'gulp-clean-css'
rev = require 'gulp-rev'
rename = require 'gulp-rename'

handleErrors = require '../lib/handle-errors'
notifyChanged = require '../lib/notify-changed'
paths = require '../lib/paths'

module.exports = (gulp)->

  process = (file)->
    notifyChanged file if file
    gulp.src 'src/main.styl'
      .pipe plumber(handleErrors)
      .pipe stylus(linenos: true)
      .pipe autoprefixer
        browsers: ['last 2 versions']
        cascade: false
      .pipe rename('app.css')
      .pipe gulp.dest(paths.devDir)
      .on 'end', ->
        gutil.log gutil.colors.green 'Stylesheets re-compiled'

  gulp.task 'watch-stylesheets', ->
    watch 'src/**/*.styl', process
    process()

  gulp.task 'stylesheets-prod', ['clean-prod'], ->
    gulp.src 'src/main.styl'
      .pipe plumber(handleErrors)
      .pipe stylus()
      .pipe autoprefixer
        browsers: ['last 2 versions']
        cascade: false
      .pipe minify()
      .pipe rename('app.css')
      .pipe rev()
      .pipe gulp.dest(paths.prodDir)
      .pipe rev.manifest()
      .pipe rename('stylesheets-manifest.json')
      .pipe gulp.dest(paths.prodDir)
