gulp = require 'gulp'
fs = require 'fs'
mkdirp = require 'mkdirp'
http = require 'http'

module.exports = (config)->

  gulp.task "#{config.prefix}zunder", ->

    scaffolds = [
      'main.coffee'
      'main.styl'
      'index.hbs'
    ]

    mkdirp config.srcDir, (err)->
      throw err if err

      scaffolds.forEach (file)->

        fs.readFile "#{config.srcDir}/#{file}", (err)->
          return unless err
          # err indicates the file doesn't exist
          # which is the only case where we want to touch it

          fs.readFile "#{__dirname}/../scaffold/#{file}", { encoding: 'utf-8' }, (err, contents)->
            throw err if err
            fs.writeFile "#{config.srcDir}/#{file}", contents

    return unless config.flavor is 'ember'

    fs.readFile 'package.json', (err, contents)->
      throw err if err

      data = JSON.parse contents

      data.browser ||= {}
      data.browser.ember ||= "./#{config.srcDir}/vendor/ember.js"

      data['browserify-shim'] ||= {}
      data['browserify-shim'].ember ||= {}
      data['browserify-shim'].ember.exports ||= 'Ember'
      data['browserify-shim'].ember.depends ||= []
      unless data['browserify-shim'].ember.depends.indexOf('jquery:jQuery') >= 0
        data['browserify-shim'].ember.depends.push 'jquery:jQuery'
      unless data['browserify-shim'].ember.depends.indexOf('handlebars:Handlebars') >= 0
        data['browserify-shim'].ember.depends.push 'handlebars:Handlebars'

      fs.writeFile 'package.json', JSON.stringify(data, null, 2) + '\n'

    mkdirp "#{config.srcDir}/vendor", (err)->
      throw err if err

      fs.exists "#{config.srcDir}/vendor/ember.js", (exists)->
        return if exists

        writeStream = fs.createWriteStream "#{config.srcDir}/vendor/ember.js"
        getEmber = http.get 'http://builds.emberjs.com/release/ember.js', (res)->
          res.pipe writeStream

        getEmber.on 'error', (err)-> throw err
