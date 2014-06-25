gulp = require 'gulp'
server = require '../lib/server'
deploy = require '../lib/deploy'

module.exports = (config)->

  devDeps = [
    "#{config.prefix}watch-scripts"
    "#{config.prefix}watch-stylesheets"
    "#{config.prefix}watch-static"
    "#{config.prefix}dev-index"
  ]

  prodDeps = [
    "#{config.prefix}build-scripts"
    "#{config.prefix}build-stylesheets"
    "#{config.prefix}copy-static"
    "#{config.prefix}prod-index"
  ]

  gulp.task "#{config.prefix}dev", devDeps, -> server '_dev'

  gulp.task "#{config.prefix}build", prodDeps

  gulp.task "#{config.prefix}prod", ["#{config.prefix}build"], -> server '_build'

  gulp.task "#{config.prefix}deploy", ["#{config.prefix}build"], -> deploy()

  gulp.task "#{config.prefix}default", ["#{config.prefix}dev"]

