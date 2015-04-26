fs = require 'fs'
mkdirp = require 'mkdirp'
http = require 'http'

module.exports = (gulp, config)->

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
