fs = require 'fs'
gulpWebpack = require 'gulp-webpack'
gutil = require 'gulp-util'
rev = require 'gulp-rev'
rename = require 'gulp-rename'
uglify = require 'gulp-uglify'
watch = require 'gulp-watch'
_ = require 'lodash'
webpack = require 'webpack'
notifyChanged = require '../lib/notify-changed'

module.exports = (gulp, config)->

  gulp.task "#{config.prefix}scripts", ->
    gulp.src config.webpackConfig.entry
      .pipe gulpWebpack(config.webpackConfig, webpack)
      .pipe gulp.dest(config.devDir)

  gulp.task "#{config.prefix}watch-scripts", ["#{config.prefix}scripts"], ->
    watch ['src/**/*.js', 'src/**/*.jsx'], (file)->
      notifyChanged file
      gulp.src config.webpackConfig.entry
        .pipe gulpWebpack(config.webpackConfig, webpack)
        .pipe gulp.dest(config.devDir)

  gulp.task "#{config.prefix}scripts-prod", ["#{config.prefix}apply-prod-environment"], ->
    webpackConfig = _.extend {}, config.webpackConfig,
      plugins: (config.webpackConfig.plugins or []).concat(
        new webpack.DefinePlugin 'process.env.NODE_ENV': JSON.stringify('production')
      )

    gulp.src config.webpackConfig.entry
      .pipe gulpWebpack(webpackConfig, webpack)
      .pipe uglify()
      .pipe rev()
      .pipe gulp.dest(config.prodDir)
      .pipe rev.manifest()
      .pipe rename('scripts-manifest.json')
      .pipe gulp.dest(config.prodDir)
