'use strict'

const _ = require('lodash')
const babel = require('gulp-babel')
const config = require('./config')
const globSync = require('glob').sync
const gulpif = require('gulp-if')
const gutil = require('gulp-util')
const mocha = require('gulp-spawn-mocha')
const Mocha = require('mocha')
const pathUtil = require('path')
const plumber = require('gulp-plumber')
const through = require('through')
const vfs = require('vinyl-fs')
const watch = require('gulp-watch')

const babelConfig = require('./babel-config')
const { closeOnExit } = require('./exit')
const handleErrors = require('./handle-errors')
const util = require('./util')

const scriptsGlob = 'src/**/*.+(js|jsx|coffee|cjsx)'
const undertakerNoop = () => Promise.resolve()
const testSetupFile = () => config.testSetup

function hasSpecs () {
  return !!globSync('src/**/*.spec.*').length
}

function getSpecFile (file) {
  let fileName = file.basename.replace('.jsx', '.js').replace('.cjsx', '.coffee')
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

function buildScripts (globOrFile) {
  let file = globOrFile
  let dest = config.testDir

  if (!_.isArray(globOrFile)) {
    file = globOrFile.path
    dest = pathUtil.dirname(file).replace('src', config.testDir).replace(`${__dirname}/`, '')
  }

  return vfs.src(file)
    .pipe(plumber(handleErrors('Tests', (err) => {
      // ignore mocha exit errors and non-spec compile errors, since
      // browserify should catch those
      return !/Mocha exited/.test(err.message) && /\.spec\./.test(file)
    })))
    .pipe(babel(babelConfig()))
    .pipe(vfs.dest(dest))
}

module.exports = () => {
  return {
    run () {
      if (!hasSpecs()) {
        util.logError('No tests found to run. Tests must be suffixed with .spec.{ext}, like .spec.js or .spec.coffee')
        return undertakerNoop()
      }

      util.logSubTask('running tests')
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
    },

    watch () {
      if (!hasSpecs()) return undertakerNoop()

      util.logSubTask('watching tests')
      const watcher =  watch(scriptsGlob, (file) => {
        const specFile = getSpecFile(file)
        return buildScripts(file)
          .pipe(passSpecFile(specFile))
          .pipe(gulpif(!!specFile, mocha({
            r: util.fileExists(testSetupFile()) ? testSetupFile() : undefined,
          })))
      })
      buildScripts([scriptsGlob])

      closeOnExit(watcher)

      return watcher
    },
  }
}
