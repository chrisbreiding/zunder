watch = require 'gulp-watch'
fs = require 'fs'
build = require '../lib/build-index'

module.exports = (gulp, config)->

  process = ->
    gulp.src "#{config.srcDir}/index.hbs"
      .pipe build(['app.js'], ['app.css'])
      .pipe gulp.dest(config.devDir)

  gulp.task "#{config.prefix}watch-html", ->
    watch "#{config.srcDir}/index.hbs", process
    process()

  scriptsManifest = "#{config.prodDir}/scripts-manifest.json"
  stylesheetsManifest = "#{config.prodDir}/stylesheets-manifest.json"

  gulp.task "#{config.prefix}html-prod", ["#{config.prefix}scripts-prod", "#{config.prefix}stylesheets-prod"], ->
    scriptName = JSON.parse(fs.readFileSync(scriptsManifest))['app.js']
    stylesheetName = JSON.parse(fs.readFileSync(stylesheetsManifest))['app.css']
    fs.unlinkSync scriptsManifest
    fs.unlinkSync stylesheetsManifest

    gulp.src "#{config.srcDir}/index.hbs"
      .pipe build([scriptName], [stylesheetName])
      .pipe gulp.dest(config.prodDir)
