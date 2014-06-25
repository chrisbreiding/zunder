connect = require 'connect'
portfinder = require 'portfinder'
gutil = require 'gulp-util'

module.exports = (dir)->

  portfinder.getPort (err, port)->
    connect
      .createServer connect.static dir
      .listen port, ->
        url = "http://localhost:#{port}"
        gutil.log "listening on #{gutil.colors.yellow url}..."
