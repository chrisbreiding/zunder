babelify = require 'babelify'
browserify = require 'browserify'
buffer = require 'vinyl-buffer'
plumber = require 'gulp-plumber'
rename = require 'gulp-rename'
rev = require 'gulp-rev'
source = require 'vinyl-source-stream'
uglify = require 'gulp-uglify'
watchify = require 'watchify'

babelPresetEs2015 = require 'babel-preset-es2015'
babelPresetReact = require 'babel-preset-react'

handleErrors = require '../lib/handle-errors'
notifyChanged = require '../lib/notify-changed'

module.exports = (gulp, config)->
  entries = [if config.srcFile then "./#{config.srcDir}/#{srcFile}" else "./#{config.srcDir}/main.jsx"]
  extensions = ['.js', '.jsx']

  bundle = (bundler, destination)->
    bundler
      .bundle()
      .on 'error', handleErrors
      .pipe plumber(handleErrors)
      .pipe source('app.js')
      .pipe gulp.dest(destination)

  gulp.task "#{config.prefix}watch-scripts", ->
    bundler = browserify
      entries: entries
      extensions: extensions
      cache: {}
      packageCache: {}

    watcher = watchify bundler

    bundler.transform babelify, presets: [babelPresetEs2015, babelPresetReact]

    bundle bundler, config.devDir

    rebundle = (files)->
      for file in files
        notifyChanged event: 'change', path: file
      bundle bundler, config.devDir

    watcher.on 'update', rebundle

    rebundle

  gulp.task "#{config.prefix}scripts-prod", ["#{config.prefix}apply-prod-environment"], ->
    browserify { entries, extensions }
      .transform babelify, presets: ["es2015", "react"]
      .bundle()
      .on 'error', handleErrors
      .pipe plumber(handleErrors)
      .pipe source('app.js')
      .pipe buffer()
      .pipe uglify()
      .pipe rev()
      .pipe gulp.dest(config.prodDir)
      .pipe rev.manifest()
      .pipe rename('scripts-manifest.json')
      .pipe gulp.dest(config.prodDir)
