deploy = require '../lib/deploy'
server = require '../lib/server'

module.exports = (gulp, config)->

  gulp.task "#{config.prefix}watch", [
    "#{config.prefix}watch-scripts"
    "#{config.prefix}watch-stylesheets"
    "#{config.prefix}watch-static"
    "#{config.prefix}watch-html"
    "#{config.prefix}dev-server"
  ]

  gulp.task "#{config.prefix}build-prod", [
    "#{config.prefix}scripts-prod"
    "#{config.prefix}stylesheets-prod"
    "#{config.prefix}copy-static"
    "#{config.prefix}html-prod"
  ]

  gulp.task "#{config.prefix}prod", ["#{config.prefix}build-prod"], -> server config.prodDir, config.prodPort

  gulp.task "#{config.prefix}deploy", ["#{config.prefix}build-prod"], -> deploy config.prodDir

  gulp.task "#{config.prefix}default", ["#{config.prefix}watch"]
