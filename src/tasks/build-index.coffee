gulp  = require 'gulp'
fs = require 'fs'
build = require '../lib/build-index'

module.exports = (config)->

  gulp.task "#{config.prefix}dev-index", ->
    gulp.src "#{config.srcDir}/index.hbs"
      .pipe build(['app.js'], ['app.css'])
      .pipe gulp.dest(config.devDir)

  scriptsManifest = "#{config.prodDir}/scripts-manifest.json"
  stylesheetsManifest = "#{config.prodDir}/stylesheets-manifest.json"

  gulp.task "#{config.prefix}prod-index", ["#{config.prefix}build-scripts", "#{config.prefix}build-stylesheets"], ->
    scriptName = JSON.parse(fs.readFileSync(scriptsManifest))['app.js']
    stylesheetName = JSON.parse(fs.readFileSync(stylesheetsManifest))['app.css']
    fs.unlinkSync scriptsManifest
    fs.unlinkSync stylesheetsManifest

    gulp.src "#{config.srcDir}/index.hbs"
      .pipe build([scriptName], [stylesheetName])
      .pipe gulp.dest(config.prodDir)
