gulp = require 'gulp'
fs = require 'fs'
mkdirp = require 'mkdirp'
http = require 'http'

module.exports = (config)->

  gulp.task "#{config.prefix}zunder", ->

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

    scaffolds = [
      'app.coffee'
      'app.styl'
      'index.hbs'
      'router.coffee'
    ]

    mkdirp 'app/vendor', (err)->
      throw err if err

      scaffolds.forEach (file)->

        fs.readFile "app/#{file}", (err)->
          return unless err
          # err indicates the file doesn't exist
          # which is the only case where we want to touch it

          fs.readFile "#{__dirname}/../scaffold/#{file}", { encoding: 'utf-8' }, (err, contents)->
            throw err if err
            fs.writeFile "app/#{file}", contents

      writeStream = fs.createWriteStream 'app/vendor/ember.js'
      getEmber = http.get 'http://builds.emberjs.com/tags//ember.js', (res)->
        res.pipe writeStream

      getEmber.on 'error', (err)-> throw err
