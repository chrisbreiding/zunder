through = require 'through2'
emberPrecompile = require 'ember-precompile'
Handlebars = require 'handlebars'

module.exports = (file)->
  return through() if file.split('.').pop() isnt 'hbs'

  through.obj (chunk, enc, callback)->
    compiled = emberPrecompile file, {}
    @push "(function(){var Ember = require('ember');#{compiled}}());"
    callback()
