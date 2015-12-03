fs = require 'fs'
mkdirp = require 'mkdirp'
http = require 'http'
ncp = require 'ncp'
path = require 'path'


module.exports = (gulp, config)->

  src = (path)-> "#{config.srcDir}/#{path}"

  gulp.task "#{config.prefix}zunder", ->

    scaffoldFiles = [
      'webpack.config.js'
      src 'index.hbs'
      src 'main.js'
      src 'main.styl'
      src 'routes.jsx'
      src 'app/app.jsx'
      src 'lib/base.styl'
      src 'lib/variables.styl'
    ]

    scaffoldDirs = [
      src 'vendor/fontawesome'
      src 'vendor/fonts'
    ]

    mkdirp config.srcDir, (err)->
      throw err if err

      scaffoldFiles.forEach (file)->

        fs.readFile file, (err)->
          return unless err
          # err indicates the file doesn't exist
          # which is the only case where we want to touch it

          fs.readFile "#{__dirname}/../scaffold/#{file}", { encoding: 'utf-8' }, (err, contents)->
            throw err if err
            fs.writeFile file, contents

      scaffoldDirs.forEach (dir)->

        fs.stat dir, (err, stats)->
          return unless err
          # err indicates the dir doesn't exist
          # which is the only case where we want to touch it

          ncp path.resolve("#{__dirname}/../scaffold/#{dir}"), dir
