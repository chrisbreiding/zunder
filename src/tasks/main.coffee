deploy = require '../lib/deploy'
paths = require '../lib/paths'
server = require '../lib/server'

module.exports = (gulp)->

  gulp.task 'watch', [
    'watch-scripts'
    'watch-stylesheets'
    'watch-static'
    'watch-html'
    'dev-server'
  ]

  gulp.task 'build-prod', [
    'scripts-prod'
    'stylesheets-prod'
    'copy-static'
    'html-prod'
  ]

  gulp.task 'apply-prod-environment', -> process.env.NODE_ENV = 'production'

  gulp.task 'prod', ['build-prod'], -> server paths.prodDir

  gulp.task 'deploy', ['build-prod'], -> deploy paths.prodDir

  gulp.task 'default', ['watch']
