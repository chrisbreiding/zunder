'use strict'

const _ = require('lodash')
const babel = require('gulp-babel')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const envifyCustom = require('envify/custom')
const gulpif = require('gulp-if')
const glob = require('glob')
const fs = require('fs-extra')
const path = require('path')
const plumber = require('gulp-plumber')
const resolutions = require('browserify-resolutions')
const source = require('vinyl-source-stream')
const sourcemaps = require('gulp-sourcemaps')
const streamToPromise = require('stream-to-promise')
const minify = require('gulp-babel-minify')
const vfs = require('vinyl-fs')
const watchify = require('watchify')

const errors = require('./errors')
const notifyChanged = require('./notify-changed')
const config = require('./config')
const util = require('./util')
const scriptsConfig = require('./scripts-config')

const handleTaskError = errors.createTaskErrorHandler('Scripts')
const handleFatalError = errors.createFatalErrorHandler('Scripts')

const logColor = 'cyan'

const extensionsGlobPart = 'js|jsx|coffee|cjsx|ts|tsx'
const scriptsGlob = `src/**/*.+(${extensionsGlobPart})`
const noSpecsGlob = `!src/**/*.spec.+(${extensionsGlobPart})`

const getSrcFiles = () => {
  let allFound = true

  const srcFiles = _.map(config.getScripts(), (outputName, scriptSourceGlob) => {
    const found = glob.sync(path.join(process.cwd(), scriptSourceGlob), { nodir: true })
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

const copy = (globOrFile, env, customErrorHandler = () => null) => {
  let file = globOrFile
  let dest = config.testDir

  if (!_.isArray(globOrFile)) {
    file = globOrFile.path
    dest = path.dirname(file).replace('src', config.testDir).replace(`${__dirname}/`, '')
  }

  util.logActionStart(logColor, `Copying scripts (${env})`)

  return vfs.src(file)
  .pipe(plumber(customErrorHandler(file) || handleTaskError))
  .pipe(babel(scriptsConfig.getBabelConfig(config)))
  .pipe(vfs.dest(dest))
  .on('finish', () => {
    util.logActionEnd(logColor, `Finished copying scripts (${env})`)
  })
}

const copyDev = () => {
  return copy([scriptsGlob], 'dev')
}

const copyProd = () => {
  return copy([scriptsGlob, noSpecsGlob], 'prod')
}

const defaultBrowserifyConfig = {
  transform: [
    [require.resolve('babelify'), {
      presets: [require.resolve('@babel/preset-env')],
    }],
  ],
}

const addBrowserifyConfig = (addBrowserifyConfigTo) => {
  _.each(addBrowserifyConfigTo, (pathOrOptions) => {
    const isSimple = _.isString(pathOrOptions)
    const filePath = isSimple ? pathOrOptions : pathOrOptions.path
    const options = isSimple ? defaultBrowserifyConfig : (pathOrOptions.options || defaultBrowserifyConfig)
    const packagePath = path.join(filePath, 'package.json')

    const packageJson = fs.readJsonSync(packagePath)
    packageJson.browserify = options
    fs.outputJsonSync(packagePath, packageJson, {
      spaces: 2,
    })
  })
}

const bundleDev = ({ bundler, externalLibs, outputName, isExternal, exitOnError }) => {
  const errorHandler = exitOnError ? handleFatalError : handleTaskError
  const useSourceMaps = !!config.browserifyOptions.debug

  return streamToPromise(
    bundler
    .plugin(resolutions, config.resolutions)[isExternal ? 'require' : 'external'](externalLibs)
    .bundle()
    .on('error', errorHandler)
    .pipe(gulpif(!exitOnError, plumber(errorHandler)))
    .pipe(source(outputName))
    .pipe(gulpif(useSourceMaps, buffer()))
    .pipe(gulpif(useSourceMaps, sourcemaps.init({ loadMaps: true })))
    .pipe(gulpif(useSourceMaps, sourcemaps.write('./')))
    .pipe(vfs.dest(config.devDir))
  )
}

const watch = () => {
  util.logSubTask('Watching scripts')

  const srcFiles = getSrcFiles()

  addBrowserifyConfig(config.addBrowserifyConfigTo)

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
    const useSourceMaps = !!config.browserifyOptions.debug

    function rebundle (files = []) {
      files.forEach((filePath) => {
        notifyChanged(logColor, `Bundling ${coloredScriptName} after`, { path: filePath })
      })

      return bundler.bundle()
      .on('error', handleTaskError)
      .pipe(plumber(handleTaskError))
      .pipe(source(outputName))
      .pipe(gulpif(useSourceMaps, buffer()))
      .pipe(gulpif(useSourceMaps, sourcemaps.init({ loadMaps: true })))
      .pipe(gulpif(useSourceMaps, sourcemaps.write('./')))
      .pipe(vfs.dest(config.devDir))
      .on('finish', () => {
        util.logActionEnd(logColor, `Finished bundling ${coloredScriptName}`)
      })
    }

    const env = fs.readJsonSync(path.join(process.cwd(), '.env'), { throws: false })
    if (env) {
      bundler.transform(envifyCustom(_.extend(env, { _: 'purge' })))
    }

    bundler.on('update', rebundle)
    util.logActionStart(logColor, `Bundling ${coloredScriptName}`)
    rebundle()

    const externalBundles = _.map(config.externalBundles, (external) => {
      return bundleDev({
        bundler: browserify(),
        externalLibs: external.libs,
        outputName: external.scriptName,
        isExternal: true,
        exitOnError: false,
      })
    })

    return Promise.all([rebundle].concat(externalBundles))
  }))
}

const buildDev = () => {
  util.logActionStart(logColor, 'Building scripts (dev)')

  const srcFiles = getSrcFiles()

  addBrowserifyConfig(config.addBrowserifyConfigTo)

  return Promise.all(_.map(srcFiles, ([srcFile, outputName]) => {
    const entries = [srcFile]
    const externalLibs = _.map(_.flatMap(config.externalBundles, 'libs'), 'file')
    const bundler = browserify(_.extend({ entries }, config.browserifyOptions))

    const env = fs.readJsonSync(path.join(process.cwd(), '.env'), { throws: false })
    if (env) {
      bundler.transform(envifyCustom(_.extend(env, { _: 'purge' })))
    }

    const mainBundle = bundleDev({
      bundler,
      externalLibs,
      outputName,
      isExternal: false,
      exitOnError: true,
    })
    const externalBundles = _.map(config.externalBundles, (external) => {
      return bundleDev({
        bundler: browserify(),
        externalLibs: external.libs,
        outputName: external.scriptName,
        isExternal: true,
        exitOnError: true,
      })
    })

    return Promise.all([mainBundle].concat(externalBundles))
  }))
  .then(() => {
    util.logActionEnd(logColor, 'Finished building scripts (dev)')
  })
}

const bundleProd = ({ bundler, externalLibs, outputName, isExternal }) => {
  const useSourceMaps = !!config.browserifyOptions.debug

  return streamToPromise(
    bundler
    .plugin(resolutions, config.resolutions)[isExternal ? 'require' : 'external'](externalLibs)
    .bundle()
    .on('error', handleFatalError)
    .pipe(source(outputName))
    .pipe(buffer())
    .pipe(gulpif(useSourceMaps, sourcemaps.init({ loadMaps: true })))
    .pipe(minify())
    .on('error', handleFatalError)
    .pipe(gulpif(useSourceMaps, sourcemaps.write('./')))
    .pipe(vfs.dest(config.prodDir))
  )
}

const buildProd = () => {
  util.logActionStart(logColor, 'Building scripts (prod)')

  const externalLibs = _.map(_.flatMap(config.externalBundles, 'libs'), 'file')
  const srcFiles = getSrcFiles()

  addBrowserifyConfig(config.addBrowserifyConfigTo)

  return Promise.all(_.map(srcFiles, ([srcFile, outputName]) => {
    const entries = [srcFile]
    const bundler = browserify(_.extend({ entries }, config.browserifyOptions))

    const env = fs.readJsonSync(path.join(process.cwd(), '.env'), { throws: false })
    if (env) {
      bundler.transform(envifyCustom(_.extend(env, { _: 'purge' })))
    }

    const mainBundle = bundleProd({
      bundler,
      externalLibs,
      outputName,
      isExternal: false,
    })
    const externalBundles = _.map(config.externalBundles, (external) => {
      return bundleProd({
        bundler: browserify(),
        externalLibs: external.libs,
        outputName: external.scriptName,
        isExternal: true,
      })
    })

    return Promise.all([mainBundle].concat(externalBundles))
  }))
  .then(() => {
    util.logActionEnd(logColor, 'Finished building scripts (prod)')
  })
}

module.exports = () => {
  return {
    copy,
    copyDev,
    copyProd,

    watch,
    buildDev,
    buildProd,
  }
}
