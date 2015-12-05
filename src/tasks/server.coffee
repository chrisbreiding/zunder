nodemon = require 'gulp-nodemon'

module.exports = (gulp, config)->

  gulp.task "#{config.prefix}dev-server", ->
    args = ["--devDir=#{config.devDir}"]
    args.push "--devPort=#{config.devPort}" if config.devPort?

    nodemon
      script: "#{__dirname}/../lib/run-dev-server.js"
      watch: ["#{process.cwd()}/server"]
      args: args
