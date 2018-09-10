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

const copyFiles = (dest, env) => (file) => {
  if (file) {
    notifyChanged(logColor, `Copying ${util.colors.magenta(pathUtil.basename(file.path))} after`, file)
  } else {
    util.logActionStart(logColor, `Copying static files (${env})`)
  }

  return Promise.resolve()
  .then(() => {
    if (_.isArray(config.staticGlobs)) {
      return copy(config.staticGlobs, dest)
    } else {
      return Promise.all(_.map(config.staticGlobs, (dir, glob) => {
        return copy(glob, `${dest}${dir}`)
      }))
    }
  })
  .then(() => {
    const message = file ?
      `Finished copying ${util.colors.magenta(pathUtil.basename(file.path))}` :
      `Finished copying static files (${env})`

    util.logActionEnd(logColor, message)
  })
}

module.exports = () => {
  return {
    watch () {
      util.logSubTask('Watching static files')

      const watches = _.isArray(config.staticGlobs) ? config.staticGlobs : _.keys(config.staticGlobs)
      const watcher = watch(watches, (file) => {
        return copyFiles(config.devDir, 'dev')(file).then(() => {
        })
      })
      copyFiles(config.devDir, 'dev')()

      closeOnExit(watcher)

      return watcher
    },

    buildDev () {
      return copyFiles(config.devDir, 'dev')()
    },

    buildProd () {
      return copyFiles(config.prodDir, 'prod')()
    },
  }
}
