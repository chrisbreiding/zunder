'use strict'

const fs = require('fs')
const pathUtil = require('path')
const autoprefixer = require('gulp-autoprefixer')
const gulpif = require('gulp-if')
const minify = require('gulp-clean-css')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const stylus = require('gulp-stylus')
const gulpWatch = require('gulp-watch')
const _ = require('lodash')
const vfs = require('vinyl-fs')
const streamToPromise = require('stream-to-promise')

const errors = require('./errors')
const notifyChanged = require('./notify-changed')
const stylesheetsConfig = require('./stylesheets-config')
const config = require('./config')
const util = require('./util')
const { closeOnExit } = require('./exit')

const handleTaskError = errors.createTaskErrorHandler('Stylesheets')
const handleFatalError = errors.createFatalErrorHandler('Stylesheets')

const logColor = 'blue'

const getSass = () => {
  const sass = require('gulp-sass')

  // This is so we can use our desired version of node-sass
  sass.compiler = require('node-sass')

  return sass
}

function noop () {}

const files = {
  'styl': {
    dev: () => stylus({ linenos: true, 'include css': true }),
    prod: () => stylus({ 'include css': true }),
  },
  'scss': {
    dev: () => getSass()(stylesheetsConfig.getSassConfigForEnv(config, 'dev')),
    prod: () => getSass()(stylesheetsConfig.getSassConfigForEnv(config, 'prod')),
  },
}

function getSrcFiles () {
  let allFound = true

  const stylesheets = config.getStylesheets()

  const srcFiles = _.map(stylesheets, ({ watch, output }, srcFile) => {
    try {
      fs.statSync(pathUtil.join(process.cwd(), srcFile))
    } catch (e) {
      allFound = false

      return []
    }

    const compiler = files[_.last(srcFile.split('.'))]

    if (!compiler) {
      util.logError(`Source stylesheet must be .scss or .styl. You tried: ${srcFile}`)
    }

    return { srcFile, watch, compiler, output }
  })

  if (!allFound) {
    util.logError(`The following files must all exist:\n- ${_.keys(stylesheets).join('\n- ')}\n`)

    return
  }

  return srcFiles
}

const autoprefixOptions = { overrideBrowserslist: ['last 2 versions'], cascade: false }

const buildStylesheets = ({ srcFile, compiler, output }, exitOnError, logOnFinish, file) => {
  const coloredStylesheetName = util.colors.magenta(output)

  if (file) {
    notifyChanged(logColor, `Compiling ${coloredStylesheetName} after`, file)
  }

  return streamToPromise(
    vfs
    .src(srcFile)
    .pipe(gulpif(!exitOnError, plumber(handleTaskError)))
    .pipe(compiler.dev())
    .on('error', exitOnError ? handleFatalError : noop)
    .pipe(autoprefixer(autoprefixOptions))
    .pipe(rename(output))
    .pipe(vfs.dest(config.devDir))
    .on('end', () => {
      if (logOnFinish) {
        util.logActionEnd(logColor, 'Finished compiling', coloredStylesheetName)
      }
    }),
  )
}

const watch = () => {
  util.logSubTask('Watching stylesheets')

  return Promise.all(_.map(getSrcFiles(), (stylesheetConfig) => {
    util.logActionStart(logColor, 'Compiling', util.colors.magenta(stylesheetConfig.output))
    const watcher = gulpWatch(stylesheetConfig.watch, _.partial(buildStylesheets, stylesheetConfig, false, true))

    closeOnExit(watcher)
    buildStylesheets(stylesheetConfig, false, true)

    return streamToPromise(watcher)
  }))
}

const buildDev = () => {
  util.logActionStart(logColor, 'Building stylesheets (dev)')

  return Promise.all(_.map(getSrcFiles(), (stylesheetConfig) => {
    return buildStylesheets(stylesheetConfig, false, false)
  }))
  .then(() => {
    util.logActionEnd(logColor, 'Finished building stylesheets (dev)')
  })
}

const buildProd = () => {
  util.logActionStart(logColor, 'Building stylesheets (prod)')

  return Promise.all(_.map(getSrcFiles(), ({ srcFile, compiler, output }) => {
    return streamToPromise(
      vfs
      .src(srcFile)
      .pipe(compiler.prod())
      .on('error', handleFatalError)
      .pipe(autoprefixer(autoprefixOptions))
      .pipe(minify())
      .pipe(rename(output))
      .pipe(vfs.dest(config.prodDir)),
    )
  }))
  .then(() => {
    util.logActionEnd(logColor, 'Finished building stylesheets (prod)')
  })
}

module.exports = () => {
  return {
    watch,
    buildDev,
    buildProd,
  }
}
