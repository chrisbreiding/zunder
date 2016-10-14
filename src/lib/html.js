const _ = require('lodash')
const del = require('del')
const fs = require('fs')
const watch = require('gulp-watch')
const vfs = require('vinyl-fs')

const build = require('./build-index')
const notifyChanged = require('./notify-changed')
const config = require('./config')
const util = require('./util')
const { closeOnExit } = require('./exit')

function process (file) {
  if (file) notifyChanged(file)

  const scriptNames = _.flatMap(config.externalBundles, 'scriptName').concat([config.scriptName])

  return vfs.src('src/*.hbs')
    .pipe(build(scriptNames, [config.stylesheetName]))
    .pipe(vfs.dest(config.devDir))
}

module.exports = () => {
  return {
    watch () {
      util.logSubTask('watching hbs files')

      const watcher = watch('src/*.hbs', process)
      process()

      closeOnExit(watcher)

      return watcher
    },

    buildDev () {
      util.logSubTask('building hbs files (dev)')

      process()
    },

    buildProd () {
      util.logSubTask('building hbs files')

      const scriptNames = _.map(config.externalBundles, 'scriptName').concat(config.scriptName)
      const stylesheetNames = [config.stylesheetName]

      let cacheBustedScriptNames
      let cacheBustedStylesheetNames

      if (config.cacheBust) {
        const cacheManifest = JSON.parse(fs.readFileSync(`${config.prodDir}/cache-manifest.json`))
        cacheBustedScriptNames = _.map(scriptNames, (scriptName) => cacheManifest[scriptName])
        cacheBustedStylesheetNames = _.map(stylesheetNames, (stylesheetName) => cacheManifest[stylesheetName])
        del(`${config.prodDir}/cache-manifest.json`)
      } else {
        cacheBustedScriptNames = scriptNames
        cacheBustedStylesheetNames = stylesheetNames
      }

      return vfs.src('src/index.hbs')
        .pipe(build(cacheBustedScriptNames, cacheBustedStylesheetNames))
        .pipe(vfs.dest(config.prodDir))
    },
  }
}
