'use strict'

const _ = require('lodash')
const babel = require('gulp-babel')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const envifyCustom = require('envify/custom')
const gulpif = require('gulp-if')
const glob = require('glob')
const fs = require('fs-extra')
const pathUtil = require('path')
const plumber = require('gulp-plumber')
const resolutions = require('browserify-resolutions')
const source = require('vinyl-source-stream')
const streamToPromise = require('stream-to-promise')
const minify = require('gulp-babel-minify')
const vfs = require('vinyl-fs')
const watchify = require('watchify')

const errors = require('./errors')
const notifyChanged = require('./notify-changed')
const config = require('./config')
const util = require('./util')

const handleTaskError = errors.createTaskErrorHandler('Scripts')
const handleFatalError = errors.createFatalErrorHandler('Scripts')

const logColor = 'cyan'

const extensionsGlobPart = 'js|jsx|coffee|cjsx|ts|tsx'
const scriptsGlob = `src/**/*.+(${extensionsGlobPart})`
const noSpecsGlob = `!src/**/*.spec.+(${extensionsGlobPart})`

function getSrcFiles () {
  let allFound = true

  const srcFiles = _.map(config.getScripts(), (outputName, scriptSourceGlob) => {
    const found = glob.sync(pathUtil.join(process.cwd(), scriptSourceGlob), { nodir: true })
    if (!found || !found.length) {
      allFound = false
      return []
    }
    return [found[0], outputName]
  })

  if (!allFound) {
    util.fail(`Expected files matching the following glob(s) to exist under src:\n- ${config.scriptSources.join('\n')}\n`)
    return
  }

  return srcFiles
}

function copy (globOrFile, customErrorHandler = () => null) {
  let file = globOrFile
  let dest = config.testDir

  if (!_.isArray(globOrFile)) {
    file = globOrFile.path
    dest = pathUtil.dirname(file).replace('src', config.testDir).replace(`${__dirname}/`, '')
  }

  return vfs.src(file)
  .pipe(plumber(customErrorHandler(file) || handleTaskError))
  .pipe(babel(config.babelConfig))
  .pipe(vfs.dest(dest))
}

function buildExternalBundles (exitOnError) {
  const errorHandler = exitOnError ? handleFatalError : handleTaskError

  return _.map(config.externalBundles, (external) => {
    return streamToPromise(
      browserify()
      .plugin(resolutions, config.resolutions)
      .require(external.libs)
      .bundle()
      .on('error', errorHandler)
      .pipe(gulpif(!exitOnError, plumber(errorHandler)))
      .pipe(source(external.scriptName))
      .pipe(vfs.dest(config.devDir))
    )
  })
}

module.exports = () => {
  return {
    watch () {
      util.logSubTask('watching scripts')

      const srcFiles = getSrcFiles()

      return Promise.all(_.map(srcFiles, ([srcFile, outputName]) => {
        const bundler = browserify(_.extend({
          entries: [srcFile],
          cache: {},
          packageCache: {},
        }, config.browserifyOptions))

        bundler
        .plugin(watchify, config.watchifyOptions)
        .plugin(resolutions, config.resolutions)

        const coloredScriptName = util.colors.magenta(outputName)

        function rebundle (files = []) {
          files.forEach((path) => {
            notifyChanged(logColor, `Bundling ${coloredScriptName} after`, { path })
          })

          return bundler.bundle()
          .on('error', handleTaskError)
          .pipe(plumber(handleTaskError))
          .on('finish', () => {
            util.logActionEnd(logColor, `Finished bundling ${coloredScriptName}`)
          })
          .pipe(source(outputName))
          .pipe(vfs.dest(config.devDir))
        }

        const env = fs.readJsonSync(pathUtil.join(process.cwd(), '.env'), { throws: false })
        if (env) {
          bundler.transform(envifyCustom(_.extend(env, { _: 'purge' })))
        }

        bundler.on('update', rebundle)
        util.logActionStart(logColor, `Bundling ${coloredScriptName}`)
        rebundle()

        return Promise.all([rebundle].concat(buildExternalBundles(true)))
      }))
    },

    copy,

    copyDev () {
      util.logSubTask('copying scripts (dev)')

      return copy([scriptsGlob])
    },

    buildDev () {
      util.logActionStart(logColor, 'Building scripts (dev)')

      const srcFiles = getSrcFiles()

      return Promise.all(_.map(srcFiles, ([srcFile, outputName]) => {
        const entries = [srcFile]
        const externalLibs = _.map(_.flatMap(config.externalBundles, 'libs'), 'file')
        const bundler = browserify(_.extend({ entries }, config.browserifyOptions))

        const env = fs.readJsonSync(pathUtil.join(process.cwd(), '.env'), { throws: false })
        if (env) {
          bundler.transform(envifyCustom(_.extend(env, { _: 'purge' })))
        }

        const mainBundle = streamToPromise(
          bundler
          .plugin(resolutions, config.resolutions)
          .external(externalLibs)
          .bundle()
          .on('error', handleFatalError)
          .pipe(source(outputName))
          .pipe(vfs.dest(config.devDir))
        )

        return Promise.all([mainBundle].concat(buildExternalBundles(false)))
      }))
      .then(() => {
        util.logActionEnd(logColor, 'Finished building scripts (dev)')
      })
    },

    copyProd () {
      util.logSubTask('copying scripts (prod)')

      return copy([scriptsGlob, noSpecsGlob])
    },

    buildProd () {
      util.logSubTask('building scripts')

      const externalLibs = _.map(_.flatMap(config.externalBundles, 'libs'), 'file')
      const srcFiles = getSrcFiles()

      return Promise.all(_.map(srcFiles, ([srcFile, outputName]) => {
        const entries = [srcFile]
        const bundler = browserify(_.extend({ entries }, config.browserifyOptions))

        const env = fs.readJsonSync(pathUtil.join(process.cwd(), '.env'), { throws: false })
        if (env) {
          bundler.transform(envifyCustom(_.extend(env, { _: 'purge' })))
        }

        const mainBundle = streamToPromise(
          bundler
          .plugin(resolutions, config.resolutions)
          .external(externalLibs)
          .bundle()
          .on('error', handleFatalError)
          .pipe(source(outputName))
          .pipe(buffer())
          .pipe(minify())
          .on('error', handleFatalError)
          .pipe(vfs.dest(config.prodDir))
        )

        const externalBundles = _.map(config.externalBundles, (external) => {
          return streamToPromise(
            browserify()
            .plugin(resolutions, config.resolutions)
            .require(external.libs)
            .bundle()
            .on('error', handleFatalError)
            .pipe(source(external.scriptName))
            .pipe(buffer())
            .pipe(minify())
            .on('error', handleFatalError)
            .pipe(vfs.dest(config.prodDir))
          )
        })

        return Promise.all([mainBundle].concat(externalBundles))
      }))
    },
  }
}
