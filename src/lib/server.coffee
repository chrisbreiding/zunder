bodyParser = require 'body-parser'
express = require 'express'
fs = require 'fs'
morgan = require 'morgan'
portfinder = require 'portfinder'
globSync = require('glob').sync
gutil = require 'gulp-util'

runServer = (dir, port)->
  mocks = globSync('./server/mocks/**/*.js').map (file) ->
    require "#{process.cwd()}#{file.replace(/^./, '')}"

  app = express()
  app.use express.static(dir)

  try
    server = require "#{process.cwd()}/server"
    app.use morgan('dev')
    app.use bodyParser.json()
    server app, express
    mocks.forEach (route) -> route app, express
  catch

  app.listen port, ->
    url = "http://localhost:#{port}"
    gutil.log "listening on #{gutil.colors.yellow url}..."

module.exports = (dir, port)->
  if port
    runServer dir, port
  else
    portfinder.getPort (err, port)->
      runServer dir, port
