server = require '../lib/server'

module.exports = (gulp, config)->

  gulp.task "#{config.prefix}dev-server", ->
    server config.devDir, config.devPort
