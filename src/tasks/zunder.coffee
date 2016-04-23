fs = require 'fs'

_ = require 'lodash'
gutil = require 'gulp-util'
globSync = require('glob').sync
RSVP = require 'rsvp'

exec = require '../lib/exec-promise'
promisify = require '../lib/promisify'

mkdirp = promisify require 'mkdirp'
readFile = promisify fs.readFile

module.exports = (gulp, config)->
  devDeps = [
    'eslint'
    'eslint-plugin-react'
  ]

  deps = [
    'react'
    'react-dom'
  ]

  gulp.task "#{config.prefix}zunder", ->
    scaffolds = _ globSync("#{__dirname}/../scaffold/**/*", dot: true)
      .map (filePath)->
        filePath.replace "#{__dirname.replace('tasks', 'scaffold')}/", ''
      .reject (filePath)->
        filePath.indexOf('.DS_Store') > -1
      .value()
    files = _.filter scaffolds, (filePath)->
      /\/?[-_A-Za-z]*\.\w+$/.test filePath
    directories = _.reject scaffolds, (filePath)->
      _.includes files, filePath

    gutil.log gutil.colors.green 'ZUNDER!'

    gutil.log 'installing dev dependencies'
    devDeps.forEach (dep)-> gutil.log "- #{dep}"
    exec "npm install --save-dev #{devDeps.join ' '} --progress=false"
      .then ->
        gutil.log 'installing dependencies'
        deps.forEach (dep)-> gutil.log "- #{dep}"
        exec "npm install --save #{deps.join ' '} --progress=false"

      .then ->
        gutil.log 'scaffolding files'

        RSVP.all directories.map (directory)->
          mkdirp directory

      .then ->
        RSVP.all files.map (file)->
          readFile(file).catch ->
            # erroring indicates the file doesn't exist
            # which is the only case where we want to touch it
            gutil.log "- #{file}"
            fs
              .createReadStream "#{__dirname}/../scaffold/#{file}"
              .pipe fs.createWriteStream(file)

      .catch (err)->
        throw err
