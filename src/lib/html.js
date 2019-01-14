'use strict'

const _ = require('lodash')
const handlebars = require('gulp-compile-handlebars')
const gulpWatch = require('gulp-watch')
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

const buildHtml = (dest, env) => (file) => {
  let destFile

  if (file) {
    destFile = util.colors.magenta(pathUtil.basename(file.path).replace('.hbs', '.html'))
    notifyChanged(logColor, `Building ${destFile} after`, file)
  } else {
    util.logActionStart(logColor, `Building html files (${env})`)
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

  return streamToPromise(
    vfs.src('src/*.hbs')
    .pipe(handlebars(handlebarsVariables))
    .pipe(rename({
      extname: '.html',
    }))
    .pipe(vfs.dest(dest))
  )
  .then(() => {
    const message = file ?
      `Finished building ${destFile}` :
      `Finished building html files (${env})`

    util.logActionEnd(logColor, message)
  })
}

const watch = () => {
  util.logSubTask('Watching hbs files')

  const watcher = gulpWatch('src/*.hbs', buildHtml(config.devDir, 'dev'))

  buildHtml(config.devDir, 'dev')()

  closeOnExit(watcher)

  return watcher
}

const buildDev = () => {
  return buildHtml(config.devDir, 'dev')()
}

const buildProd = () => {
  return buildHtml(config.prodDir, 'prod')()
}

module.exports = () => {
  return {
    watch,
    buildDev,
    buildProd,
  }
}
