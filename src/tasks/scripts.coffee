gulp = require 'gulp'
gutil = require 'gulp-util'
rev = require 'gulp-rev'
rename = require 'gulp-rename'

watchify = require 'watchify'
browserify = require 'browserify'

browserifyShim = require 'browserify-shim'
coffeeify = require 'coffeeify'
emberHbsfy = require '../lib/ember-hbsfy'
uglifyify = require 'uglifyify'

through = require 'through2'
source = require 'vinyl-source-stream'
handleErrors = require '../lib/handle-errors'

transformIf = (transform, condition)->
  if condition then transform else through

bundle = (bundler, destination)->
  bundler
    .bundle()
    .on('error', handleErrors)
    .pipe source('app.js')
    .pipe gulp.dest(destination)

module.exports = (config)->

  isEmber = config.flavor is 'ember'

  gulp.task "#{config.prefix}watch-scripts", ->
    bundler = watchify
      entries: ["./#{config.srcDir}/main.coffee"]
      extensions: ['.js', '.coffee', '.hbs']

    bundler
      .transform(transformIf(browserifyShim, isEmber))
      .transform(coffeeify)
      .transform(transformIf(emberHbsfy, isEmber))

    bundle bundler, config.devDir

    rebundle = (files)->
      for file in files
        gutil.log gutil.colors.cyan('rebundle'), file.replace process.cwd(), ''
      bundle bundler, config.devDir

    bundler.on 'update', rebundle

    rebundle

  gulp.task "#{config.prefix}build-scripts", ["#{config.prefix}clean"], ->
    browserify(
      entries: ["./#{config.srcDir}/main.coffee"]
      extensions: ['.js', '.coffee', '.hbs']
    )
      .transform(transformIf(browserifyShim, isEmber))
      .transform(coffeeify)
      .transform(transformIf(emberHbsfy, isEmber))
      .transform({ global: true }, 'uglifyify')
      .bundle()
      .on('error', handleErrors)
      .pipe source('app.js')
      .pipe rev()
      .pipe gulp.dest(config.prodDir)
      .pipe rev.manifest()
      .pipe rename('scripts-manifest.json')
      .pipe gulp.dest(config.prodDir)
