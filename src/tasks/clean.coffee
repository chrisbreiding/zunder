del = require 'del'

module.exports = (gulp, config)->

  gulp.task "#{config.prefix}clean-dev", ->
    del config.devDir

  gulp.task "#{config.prefix}clean-prod", ->
    del config.prodDir

  gulp.task "#{config.prefix}clean", ["#{config.prefix}clean-dev", "#{config.prefix}clean-prod"]
