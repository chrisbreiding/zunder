'use strict'

const config = require('./config')
const globSync = require('glob').sync
const gulpif = require('gulp-if')
const gutil = require('gulp-util')
const mocha = require('gulp-spawn-mocha')
const Mocha = require('mocha')
const through = require('through')
const gulpWatch = require('gulp-watch')

const { closeOnExit } = require('./exit')
const errors = require('./errors')
const scripts = require('./scripts')
const util = require('./util')

const scriptsGlob = 'src/**/*.+(js|jsx|coffee)'
const undertakerNoop = () => Promise.resolve()
const testSetupFile = () => config.testSetup

function hasSpecs (dir) {
  return !!globSync(`${dir}/**/*.spec.*`).length
}

function getSpecFile (file) {
  let fileName = file.basename.replace('.jsx', '.js')
  if (!/\.spec\./.test(fileName)) {
    fileName = fileName.replace('.js', '.spec.js').replace('.coffee', '.spec.coffee')
  }
  const path = file.dirname.replace('src', config.testDir)
  const filePath = `${path}/${fileName}`

  return util.fileExists(filePath) ? new gutil.File({ path: filePath }) : null
}

function passSpecFile (specFile) {
  return through(function () {
    if (specFile) this.queue(specFile)
  })
}

const errorHandler = (file) => errors.createTaskErrorHandler('Tests', (err) => {
  // ignore mocha exit errors and non-spec compile errors, since
  // browserify should catch those
  return !/Mocha exited/.test(err.message) && /\.spec\./.test(file)
})

const build = () => {
  if (!hasSpecs('src')) {
    util.logError('No tests found to build in src directory. Tests must be suffixed with .spec.{ext}, like .spec.js or .spec.coffee')
    return undertakerNoop()
  }

  return scripts().copy([scriptsGlob], 'test', errorHandler)
}

const run = () => {
  util.logSubTask('Running tests')

  if (!hasSpecs(config.testDir)) {
    util.logError(`No tests found to run in '${config.testDir}'. Ensure you have tests in your src directory and that you have built them. Tests must be suffixed with .spec.{ext}, like .spec.js or .spec.coffee`)
    return undertakerNoop()
  }

  const mocha = new Mocha()
  if (util.fileExists(testSetupFile())) {
    mocha.addFile(testSetupFile())
  }
  globSync(`${config.testDir}/**/*.spec.*`).forEach((spec) => {
    mocha.addFile(spec)
  })
  mocha.run((failures) => {
    process.on('exit', () => {
      process.exit(failures)
    })
  })
}

const watch = () => {
  if (!hasSpecs('src')) return undertakerNoop()

  util.logSubTask('Watching tests')
  const watcher = gulpWatch(scriptsGlob, (file) => {
    if (!file || file.event === 'unlink') return

    const specFile = getSpecFile(file)
    return scripts().copy(file, 'test', errorHandler)
    .pipe(passSpecFile(specFile))
    .pipe(gulpif(!!specFile, mocha({
      r: util.fileExists(testSetupFile()) ? testSetupFile() : undefined,
    })))
  })
  scripts().copy([scriptsGlob], 'test', errorHandler)

  closeOnExit(watcher)

  return watcher
}

module.exports = () => {
  return {
    build,
    run,
    watch,
  }
}
