fs = require 'fs'
watch = require 'gulp-watch'

build = require '../lib/build-index'
notifyChanged = require '../lib/notify-changed'
paths = require '../lib/paths'

module.exports = (gulp)->

  process = (file)->
    notifyChanged file if file
    gulp.src 'src/index.hbs'
      .pipe build(['app.js'], ['app.css'])
      .pipe gulp.dest(paths.devDir)

  gulp.task 'watch-html', ->
    watch 'src/index.hbs', process
    process()

  scriptsManifest = "#{paths.prodDir}/scripts-manifest.json"
  stylesheetsManifest = "#{paths.prodDir}/stylesheets-manifest.json"

  gulp.task 'html-prod', ['scripts-prod', 'stylesheets-prod'], ->
    scriptName = JSON.parse(fs.readFileSync(scriptsManifest))['app.js']
    stylesheetName = JSON.parse(fs.readFileSync(stylesheetsManifest))['app.css']
    fs.unlinkSync scriptsManifest
    fs.unlinkSync stylesheetsManifest

    gulp.src 'src/index.hbs'
      .pipe build([scriptName], [stylesheetName])
      .pipe gulp.dest(paths.prodDir)
