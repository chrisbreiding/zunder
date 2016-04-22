fs = require 'fs'

_ = require 'lodash'
gutil = require 'gulp-util'
http = require 'http'
path = require 'path'
RSVP = require 'rsvp'

exec = require '../lib/exec-promise'
promisify = require '../lib/promisify'

copyContents = promisify require 'ncp'
mkdirp = promisify require 'mkdirp'
readFile = promisify fs.readFile
writeFile = promisify fs.writeFile
readDir = promisify fs.stat

module.exports = (gulp, config)->
  src = (path)-> "#{config.srcDir}/#{path}"

  devDeps = [
    'eslint'
    'eslint-plugin-react'
  ]

  deps = [
    'react'
    'react-dom'
  ]

  scaffoldFiles = [
    '.eslintrc'
    src 'index.hbs'
    src 'main.jsx'
    src 'main.styl'
    src 'app/app.jsx'
    src 'lib/base.styl'
    src 'lib/variables.styl'
  ]

  scaffoldDirs = [
    src 'vendor/fontawesome'
    'static/fonts'
  ]

  directories = _(scaffoldFiles)
    .concat scaffoldDirs
    .filter (filePath)-> filePath.indexOf('/') > -1
    .map (filePath)-> filePath.replace /\/[a-z\.]+$/, ''
    .uniq()
    .value()

  gulp.task "#{config.prefix}zunder", ->

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
        RSVP.all scaffoldFiles.map (file)->
          readFile(file).catch ->
            # erroring indicates the file doesn't exist
            # which is the only case where we want to touch it
            readFile("#{__dirname}/../scaffold/#{file}", { encoding: 'utf-8' })
              .then (contents)->
                gutil.log "- #{file}"
                writeFile file, contents

      .then ->
        RSVP.all scaffoldDirs.map (dir)->
          readDir(dir).catch ->
            # err indicates the dir doesn't exist
            # which is the only case where we want to touch it
            gutil.log "- #{dir}/*"
            copyContents path.resolve("#{__dirname}/../scaffold/#{dir}"), dir

      .catch (err)->
        throw err
