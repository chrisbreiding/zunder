fs = require 'fs'
gulpWebpack = require 'gulp-webpack'
gutil = require 'gulp-util'
watch = require 'gulp-watch'
webpack = require 'webpack'
notifyChanged = require '../lib/notify-changed'

module.exports = (gulp, config)->

  gulp.task "#{config.prefix}scripts", ->
    gulp.src config.webpackConfig.entry
      .pipe gulpWebpack(config.webpackConfig, webpack)
      .pipe gulp.dest('dist/')

  gulp.task "#{config.prefix}watch-scripts", ["#{config.prefix}scripts"], ->
    watch ['src/**/*.js', 'src/**/*.jsx'], (file)->
      notifyChanged file
      gulp.src config.webpackConfig.entry
        .pipe gulpWebpack(config.webpackConfig, webpack)
        .pipe gulp.dest('dist/')
