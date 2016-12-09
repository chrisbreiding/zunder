'use strict'

const fs = require('fs')
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

const errors = require('./errors')
const notifyChanged = require('./notify-changed')
const config = require('./config')
const util = require('./util')
const { closeOnExit } = require('./exit')

const handleTaskError = errors.createTaskErrorHandler('Stylesheets')
const handleFatalError = errors.createFatalErrorHandler('Stylesheets')

function noop () {}

const files = {
  'main.styl': {
    watch: 'src/**/*.styl',
    dev: () => stylus({ linenos: true, 'include css': true }),
    prod: () => stylus({ 'include css': true }),
  },
  'main.scss': {
    watch: 'src/**/*.scss',
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

function getSrcConfig () {
  const srcConfig = _.reduce(files, (srcConfig, compiler, fileName) => {
    if (srcConfig) return srcConfig
    try {
      fs.readFileSync(`${process.cwd()}/src/${fileName}`)
    } catch (e) {
      return null
    }
    return { fileName, compiler }
  }, null)

  if (!srcConfig) {
    util.logError(`One of the following files must exist under src:\n- ${_.keys(files).join('\n- ')}\n`)
    return
  }

  return srcConfig
}

module.exports = () => {
  const autoprefixOptions = { browsers: ['last 2 versions'], cascade: false }

  let firstTime = true
  function buildStylesheets (exitOnError, srcConfig, file) {
    if (file) notifyChanged(file)
    return vfs.src(`src/${srcConfig.fileName}`)
      .pipe(gulpif(!exitOnError, plumber(handleTaskError)))
      .pipe(srcConfig.compiler.dev())
      .on('error', exitOnError ? handleFatalError : noop)
      .pipe(autoprefixer(autoprefixOptions))
      .pipe(rename(config.stylesheetName))
      .pipe(vfs.dest(config.devDir))
      .on('end', () => {
        if (firstTime) {
          firstTime = false
          return
        }
        util.log(util.colors.green('Stylesheets re-compiled'))
      })
  }

  return {
    watch () {
      util.logSubTask('watching stylesheets')

      const srcConfig = getSrcConfig()
      const watcher = watch(srcConfig.compiler.watch, _.partial(buildStylesheets, false, srcConfig))
      buildStylesheets(false, srcConfig)

      closeOnExit(watcher)

      return watcher
    },

    buildDev () {
      util.logSubTask('building stylesheets (dev)')

      const srcConfig = getSrcConfig()
      return buildStylesheets(true, srcConfig)
    },

    buildProd () {
      util.logSubTask('building stylesheets')

      const srcConfig = getSrcConfig()
      return vfs.src(`src/${srcConfig.fileName}`)
        .pipe(srcConfig.compiler.prod())
        .on('error', handleFatalError)
        .pipe(autoprefixer(autoprefixOptions))
        .pipe(minify())
        .pipe(rename(config.stylesheetName))
        .pipe(vfs.dest(config.prodDir))
    },
  }
}
