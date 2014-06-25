gutil = require 'gulp-util'
handlebars = require 'handlebars'
through = require 'through2'

PLUGIN_NAME = 'gulp-build-index'

module.exports = (scripts, stylesheets)->

  through.obj (file, enc, callback)->
    if file.isStream()
      @emit 'error', new gutil.PluginError(PLUGIN_NAME,  'Streaming not supported')
      return callback()

    try
      template = handlebars.compile file.contents.toString()
      compiled = template
        scripts: scripts
        stylesheets: stylesheets
    catch err
      @emit 'error', new gutil.PluginError(PLUGIN_NAME, err)
      return callback()

    file.path = gutil.replaceExtension file.path, '.html'
    file.contents = new Buffer compiled

    @push file
    callback()
