'use strict'

const _ = require('lodash')
const handlebars = require('gulp-compile-handlebars')
const watch = require('gulp-watch')
const rename = require('gulp-rename')
const vfs = require('vinyl-fs')

const notifyChanged = require('./notify-changed')
const config = require('./config')
const util = require('./util')
const { closeOnExit } = require('./exit')

const buildHtml = (dest) => (file) => {
  if (file) notifyChanged(file)

  const scripts = _.flatMap(config.externalBundles, 'scriptName').concat([config.scriptName])
  const stylesheets = [config.stylesheetName]

  return vfs.src('src/*.hbs')
    .pipe(handlebars({
      scripts,
      stylesheets,
      env: process.env,
      isDev: process.env.NODE_ENV === 'development',
      isProd: process.env.NODE_ENV === 'production',
    }))
    .pipe(rename({
      extname: '.html',
    }))
    .pipe(vfs.dest(dest))
}

module.exports = () => {
  return {
    watch () {
      util.logSubTask('watching hbs files')

      const watcher = watch('src/*.hbs', buildHtml(config.devDir))
      buildHtml(config.devDir)()

      closeOnExit(watcher)

      return watcher
    },

    buildDev () {
      util.logSubTask('building hbs files (dev)')

      return buildHtml(config.devDir)()
    },

    buildProd () {
      util.logSubTask('building hbs files')

      return buildHtml(config.prodDir)()
    },
  }
}
