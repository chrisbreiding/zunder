'use strict'

const _ = require('lodash')
const gulpWatch = require('gulp-watch')
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
    }

    return Promise.all(_.map(config.staticGlobs, (dir, glob) => {
      return copy(glob, `${dest}${dir}`)
    }))

  })
  .then(() => {
    const message = file ?
      `Finished copying ${util.colors.magenta(pathUtil.basename(file.path))}` :
      `Finished copying static files (${env})`

    util.logActionEnd(logColor, message)
  })
}

const watch = () => {
  util.logSubTask('Watching static files')

  const watches = _.isArray(config.staticGlobs) ? config.staticGlobs : _.keys(config.staticGlobs)
  const watcher = gulpWatch(watches, (file) => {
    return copyFiles(config.devDir, 'dev')(file).then(() => {
    })
  })

  copyFiles(config.devDir, 'dev')()

  closeOnExit(watcher)

  return watcher
}

const buildDev = () => {
  return copyFiles(config.devDir, 'dev')()
}

const buildProd = () => {
  return copyFiles(config.prodDir, 'prod')()
}

module.exports = () => {
  return {
    watch,
    buildDev,
    buildProd,
  }
}
