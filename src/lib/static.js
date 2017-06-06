'use strict'

const _ = require('lodash')
const watch = require('gulp-watch')
const pathUtil = require('path')
const streamToPromise = require('stream-to-promise')
const vfs = require('vinyl-fs')

const notifyChanged = require('./notify-changed')
const config = require('./config')
const util = require('./util')
const { closeOnExit } = require('./exit')

const logColor = 'green'

const copy = (globs, dest) => {
  return streamToPromise(vfs.src(globs).pipe(vfs.dest(dest)))
}

const copyFiles = (dest) => (file) => {
  if (file) {
    notifyChanged(logColor, `Copying ${util.colors.magenta(pathUtil.basename(file.path))} after`, file)
  }

  if (_.isArray(config.staticGlobs)) {
    return copy(config.staticGlobs, dest)
  } else {
    return Promise.all(_.map(config.staticGlobs, (dir, glob) => {
      return copy(glob, `${dest}${dir}`)
    }))
  }
}

module.exports = () => {
  return {
    watch () {
      util.logSubTask('watching static files')

      util.logActionStart(logColor, 'Copying static files')

      const watches = _.isArray(config.staticGlobs) ? config.staticGlobs : _.keys(config.staticGlobs)
      const watcher = watch(watches, (file) => {
        return copyFiles(config.devDir)(file).then(() => {
          util.logActionEnd(logColor, 'Finished copying', util.colors.magenta(pathUtil.basename(file.path)))
        })
      })
      copyFiles(config.devDir)().then(() => {
        util.logActionEnd(logColor, 'Finished copying static files')
      })

      closeOnExit(watcher)

      return watcher
    },

    buildDev () {
      util.logSubTask('copying static files (dev)')

      return copyFiles(config.devDir)()
    },

    buildProd () {
      util.logSubTask('copying static files')

      return copyFiles(config.prodDir)()
    },
  }
}
