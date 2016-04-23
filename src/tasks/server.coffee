nodemon = require 'gulp-nodemon'
paths = require '../lib/paths'

module.exports = (gulp)->

  gulp.task 'dev-server', ->
    nodemon
      script: "#{__dirname}/../lib/run-dev-server.js"
      watch: ["#{process.cwd()}/server"]
      args: ["--devDir=#{paths.devDir}"]
