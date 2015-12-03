fs = require 'fs'
mkdirp = require 'mkdirp'
http = require 'http'
ncp = require 'ncp'
path = require 'path'

module.exports = (gulp, config)->

  gulp.task "#{config.prefix}zunder", ->

    scaffoldFiles = [
      'index.hbs'
      'main.js'
      'main.styl'
      'routes.jsx'
      'app/app.jsx'
      'lib/base.styl'
      'lib/variables.styl'
    ]

    scaffoldDirs = [
      'vendor/fontawesome'
      'vendor/fonts'
    ]

    mkdirp config.srcDir, (err)->
      throw err if err

      scaffoldFiles.forEach (file)->

        fs.readFile "#{config.srcDir}/#{file}", (err)->
          return unless err
          # err indicates the file doesn't exist
          # which is the only case where we want to touch it

          fs.readFile "#{__dirname}/../scaffold/#{file}", { encoding: 'utf-8' }, (err, contents)->
            throw err if err
            fs.writeFile "#{config.srcDir}/#{file}", contents

      scaffoldDirs.forEach (dir)->

        fs.stat "#{config.srcDir}/#{dir}", (err, stats)->
          return unless err
          # err indicates the dir doesn't exist
          # which is the only case where we want to touch it

          ncp path.resolve("#{__dirname}/../scaffold/#{dir}"), "#{config.srcDir}/#{dir}"
