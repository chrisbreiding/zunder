'use strict'

const fs = require('fs')
const pathUtil = require('path')
const autoprefixer = require('gulp-autoprefixer')
const gulpif = require('gulp-if')
const minify = require('gulp-clean-css')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const stylus = require('gulp-stylus')
const watch = require('gulp-watch')
const _ = require('lodash')
const globber = require('node-sass-globbing')
const vfs = require('vinyl-fs')
const streamToPromise = require('stream-to-promise')

const errors = require('./errors')
const notifyChanged = require('./notify-changed')
const config = require('./config')
const util = require('./util')
const { closeOnExit } = require('./exit')

const handleTaskError = errors.createTaskErrorHandler('Stylesheets')
const handleFatalError = errors.createFatalErrorHandler('Stylesheets')

const logColor = 'blue'

function noop () {}

const files = {
  'styl': {
    dev: () => stylus({ linenos: true, 'include css': true }),
    prod: () => stylus({ 'include css': true }),
  },
  'scss': {
    dev: () => sass({
      importer: globber,
      sourceComments: true,
      outputStyle: 'expanded',
    }),
    prod: () => sass({
      importer: globber,
      outputStyle: 'compressed',
    }),
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

module.exports = () => {
  const autoprefixOptions = { browsers: ['last 2 versions'], cascade: false }

  function buildStylesheets ({ srcFile, compiler, output }, exitOnError, logOnFinish, file) {
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
          util.logActionEnd(logColor, 'Finishing compiling', coloredStylesheetName)
        }
      })
    )
  }

  return {
    watch () {
      util.logSubTask('watching stylesheets')

      return Promise.all(_.map(getSrcFiles(), (stylesheetConfig) => {
        util.logActionStart(logColor, 'Compiling', util.colors.magenta(stylesheetConfig.output))
        const watcher = watch(stylesheetConfig.watch, _.partial(buildStylesheets, stylesheetConfig, false, true))
        closeOnExit(watcher)
        buildStylesheets(stylesheetConfig, false, true)
        return streamToPromise(watcher)
      }))
    },

    buildDev () {
      util.logSubTask('building stylesheets (dev)')

      return Promise.all(_.map(getSrcFiles(), (stylesheetConfig) => {
        return buildStylesheets(stylesheetConfig, false, false)
      }))
    },

    buildProd () {
      util.logSubTask('building stylesheets')

      return Promise.all(_.map(getSrcFiles(), ({ srcFile, compiler, output }) => {
        return streamToPromise(
          vfs
          .src(srcFile)
          .pipe(compiler.prod())
          .on('error', handleFatalError)
          .pipe(autoprefixer(autoprefixOptions))
          .pipe(minify())
          .pipe(rename(output))
          .pipe(vfs.dest(config.prodDir))
        )
      }))
    },
  }
}
