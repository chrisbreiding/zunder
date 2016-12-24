'use strict'

const _ = require('lodash')
const del = require('del')
const glob = require('glob')
const handlebars = require('gulp-compile-handlebars')
const rename = require('gulp-rename')
const rev = require('gulp-rev')
const revDel = require('gulp-rev-delete-original')
const revReplace = require('gulp-rev-replace')

const vfs = require('vinyl-fs')
const config = require('./config')
const util = require('./util')

const revManifestName = 'rev-manifest.json'

module.exports = () => {
  return {
    cacheBust () {
      if (!config.cacheBust) return Promise.resolve()

      util.logSubTask('cache busting files')

      return vfs.src(`${config.prodDir}/**/*.!(html)`)
        .pipe(rev())
        .pipe(revDel())
        .pipe(vfs.dest(config.prodDir))
        .pipe(rev.manifest())
        .pipe(vfs.dest(config.prodDir))
    },

    replaceCacheNames () {
      if (!config.cacheBust) return Promise.resolve()

      const manifest = vfs.src(`${config.prodDir}/${revManifestName}`)

      return vfs.src(`${config.prodDir}/*.+(js|css|html)`)
        .pipe(revReplace({ manifest }))
        .pipe(vfs.dest(config.prodDir))
    },

    removeCacheManifest () {
      if (!config.cacheBust) return Promise.resolve()

      return del(`${config.prodDir}/${revManifestName}`)
    },

    createAppCache () {
      if (!config.appCache) return Promise.resolve()

      util.logSubTask('creating app cache manifest')
      let files = glob.sync(`${config.prodDir}/**/*`, { nodir: true })
      files = _.reject(files, (file) => /\.html$/.test(file))
      files = _.map(files, (file) => file.replace(`${config.prodDir}/`, ''))
      if (_.isFunction(config.appCacheTransform)) {
        files = config.appCacheTransform(files)
      }
      return vfs.src(`${__dirname}/appcache.manifest.hbs`)
        .pipe(handlebars({ files }))
        .pipe(rename({ extname: '' }))
        .pipe(vfs.dest(config.prodDir))
    },
  }
}
