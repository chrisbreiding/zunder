connect = require 'connect'
portfinder = require 'portfinder'
gutil = require 'gulp-util'

runServer = (dir, port)->
  connect
    .createServer connect.static dir
    .listen port, ->
      url = "http://localhost:#{port}"
      gutil.log "listening on #{gutil.colors.yellow url}..."

module.exports = (dir, port)->

  if port
    runServer dir, port
  else
    portfinder.getPort (err, port)->
      runServer dir, port
