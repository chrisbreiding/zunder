gutil = require 'gulp-util'
rev = require 'gulp-rev'
rename = require 'gulp-rename'

watchify = require 'watchify'
browserify = require 'browserify'

coffeeify = require 'coffeeify'
uglifyify = require 'uglifyify'

through = require 'through2'
source = require 'vinyl-source-stream'
handleErrors = require '../lib/handle-errors'

transformIf = (transform, condition)->
  if condition then transform else through

module.exports = (gulp, config)->

  bundle = (bundler, destination)->
    bundler
      .bundle()
      .on('error', handleErrors)
      .pipe source('app.js')
      .pipe gulp.dest(destination)

  gulp.task "#{config.prefix}watch-scripts", ->
    bundler = browserify
      entries: ["./#{config.srcDir}/main.coffee"]
      extensions: ['.js', '.coffee', '.hbs']
      cache: {}
      packageCache: {}

    watcher = watchify bundler

    bundler.transform(coffeeify)

    bundle bundler, config.devDir

    rebundle = (files)->
      for file in files
        gutil.log gutil.colors.cyan('rebundle'), file.replace process.cwd(), ''
      bundle bundler, config.devDir

    watcher.on 'update', rebundle

    rebundle

  gulp.task "#{config.prefix}build-scripts", ["#{config.prefix}clean-prod"], ->
    browserify(
      entries: ["./#{config.srcDir}/main.coffee"]
      extensions: ['.js', '.coffee', '.hbs']
    )
      .transform(coffeeify)
      .transform({ global: true }, 'uglifyify')
      .bundle()
      .on('error', handleErrors)
      .pipe source('app.js')
      .pipe rev()
      .pipe gulp.dest(config.prodDir)
      .pipe rev.manifest()
      .pipe rename('scripts-manifest.json')
      .pipe gulp.dest(config.prodDir)
