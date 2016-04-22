babelify = require 'babelify'
browserify = require 'browserify'
buffer = require 'vinyl-buffer'
rename = require 'gulp-rename'
rev = require 'gulp-rev'
source = require 'vinyl-source-stream'
uglify = require 'gulp-uglify'
watchify = require 'watchify'

handleErrors = require '../lib/handle-errors'
notifyChanged = require '../lib/notify-changed'

module.exports = (gulp, config)->

  bundle = (bundler, destination)->
    bundler
      .bundle()
      .on 'error', handleErrors
      .pipe plumber(handleErrors)
      .pipe source('app.js')
      .pipe gulp.dest(destination)

  gulp.task "#{config.prefix}watch-scripts", ->
    entry = if config.srcFile then "./#{config.srcDir}/#{srcFile}" else "./#{config.srcDir}/main.jsx"
    bundler = browserify
      entries: [entry]
      extensions: ['.js', '.coffee', '.hbs']
      cache: {}
      packageCache: {}

    watcher = watchify bundler

    bundler.transform babelify, presets: ["es2015", "react"]

    bundle bundler, config.devDir

    rebundle = (files)->
      for file in files
        notifyChanged file.replace process.cwd(), ''
      bundle bundler, config.devDir

    watcher.on 'update', rebundle

    rebundle

  gulp.task "#{config.prefix}scripts-prod", ["#{config.prefix}clean-prod"], ->
    browserify(
      entries: ["./#{config.srcDir}/main.coffee"]
      extensions: ['.js', '.coffee', '.hbs']
    )
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
