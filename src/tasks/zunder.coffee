gulp = require 'gulp'
fs = require 'fs'
mkdirp = require 'mkdirp'

module.exports = (config)->

  gulp.task "#{config.prefix}zunder", ->
  #   # create directories and files
  #   mkdirp 'app/vendor', (err)->
  #     throw err if err

  #     fs.readFile 'app/app.coffee', (err)->
  #       if err
  #         console.log err

# app
# |- vendor
# |  |- ember.js
# |- app.coffee
# |- app.styl
# |- index.hbs
# |- router.coffee

    fs.readFile 'package.json', (err, contents)->
      throw err if err

      data = JSON.parse contents

      data.browser ||= {}
      data.browser.ember ||= './app/vendor/ember.js'

      data['browserify-shim'] ||= {}
      data['browserify-shim'].ember ||= {}
      data['browserify-shim'].ember.exports ||= 'Ember'
      data['browserify-shim'].ember.depends ||= []
      unless data['browserify-shim'].ember.depends.indexOf('jquery:jQuery') >= 0
        data['browserify-shim'].ember.depends.push 'jquery:jQuery'
      unless data['browserify-shim'].ember.depends.indexOf('handlebars:Handlebars') >= 0
        data['browserify-shim'].ember.depends.push 'handlebars:Handlebars'

      fs.writeFile 'package.json', JSON.stringify(data, null, 2) + '\n'
