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

const extensionRe = /\.\w+$/
const dashUnderscoreRe = /[-_]/g

const simpleFileName = (fileName) => {
  return fileName.replace(extensionRe, '').replace(dashUnderscoreRe, '').toLowerCase()
}

const buildHtml = (dest) => (file) => {
  let destFile
  if (file) {
    destFile = util.colors.magenta(pathUtil.basename(file.path).replace('.hbs', '.html'))
    notifyChanged(logColor, `Building ${destFile} after`, file)
  }

  const externalBundles = _.flatMap(config.externalBundles, 'scriptName')
  const getScripts = (scripts) => externalBundles.concat(scripts)
  const scripts = getScripts(_.values(config.getScripts()))

  const stylesheets = _.map(config.getStylesheets(), 'output')

  let handlebarsVariables = {
    scripts,
    stylesheets,
    env: process.env,
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  }

  _.each(config.getScripts(), (outputName) => {
    handlebarsVariables[`${simpleFileName(outputName)}Scripts`] = getScripts([outputName])
  })

  _.each(config.getStylesheets(), ({ output }) => {
    handlebarsVariables[`${simpleFileName(output)}Stylesheets`] = [output]
  })

  if (_.isFunction(config.editHandlebarsVariables)) {
    handlebarsVariables = config.editHandlebarsVariables(handlebarsVariables)
  }

  return vfs.src('src/*.hbs')
  .pipe(handlebars(handlebarsVariables))
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
