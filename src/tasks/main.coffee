deploy = require '../lib/deploy'

module.exports = (gulp, config)->

  gulp.task "#{config.prefix}watch", [
    "#{config.prefix}watch-scripts"
    "#{config.prefix}watch-stylesheets"
    "#{config.prefix}watch-static"
    "#{config.prefix}watch-html"
    "#{config.prefix}dev-server"
  ]

  gulp.task "#{config.prefix}build", [
    "#{config.prefix}build-scripts"
    "#{config.prefix}build-stylesheets"
    "#{config.prefix}copy-static"
    "#{config.prefix}build-html"
  ]

  gulp.task "#{config.prefix}prod", ["#{config.prefix}build"], -> server config.prodDir, config.prodPort

  gulp.task "#{config.prefix}deploy", ["#{config.prefix}build"], -> deploy config.prodDir

  gulp.task "#{config.prefix}default", ["#{config.prefix}dev"]
