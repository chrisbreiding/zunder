'use strict'

const _ = require('lodash')
const handlebars = require('gulp-compile-handlebars')
const watch = require('gulp-watch')
const pathUtil = require('path')
const rename = require('gulp-rename')
const vfs = require('vinyl-fs')
const streamToPromise = require('stream-to-promise')

const notifyChanged = require('./notify-changed')
const config = require('./config')
const util = require('./util')
const { closeOnExit } = require('./exit')

const logColor = 'red'

const buildHtml = (dest) => (file) => {
  let destFile
  if (file) {
    destFile = util.colors.magenta(pathUtil.basename(file.path).replace('.hbs', '.html'))
    notifyChanged(logColor, `Building ${destFile} after`, file)
  }

  const scripts = _.flatMap(config.externalBundles, 'scriptName').concat([config.scriptName])
  const stylesheets = [config.stylesheetName]

  return vfs.src('src/*.hbs')
    .pipe(handlebars({
      scripts,
      stylesheets,
      env: process.env,
      isDev: process.env.NODE_ENV === 'development',
      isProd: process.env.NODE_ENV === 'production',
    }))
    .on('end', () => {
      if (file) {
        util.logActionEnd(logColor, 'Finished building', destFile)
      }
    })
    .pipe(rename({
      extname: '.html',
    }))
    .pipe(vfs.dest(dest))
}

module.exports = () => {
  return {
    watch () {
      util.logSubTask('watching hbs files')

      util.logActionStart(logColor, 'Building html files')

      const watcher = watch('src/*.hbs', buildHtml(config.devDir))
      streamToPromise(buildHtml(config.devDir)()).then(() => {
        util.logActionEnd(logColor, 'Finished building html files')
      })

      closeOnExit(watcher)

      return watcher
    },

    buildDev () {
      util.logSubTask('building hbs files (dev)')

      return buildHtml(config.devDir)()
    },

    buildProd () {
      util.logSubTask('building hbs files')

      return buildHtml(config.prodDir)()
    },
  }
}
