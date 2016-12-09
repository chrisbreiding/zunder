'use strict'

const cache = require('../lib/cache')
const config = require('../lib/config')
const { emit } = require('../lib/events')
const html = require('../lib/html')
const scripts = require('../lib/scripts')
const server = require('../lib/server')
const staticAssets = require('../lib/static')
const stylesheets = require('../lib/stylesheets')

const env = require('./env')
const clean = require('./clean')


const buildProdScripts = scripts().buildProd
const buildProdStylesheets = stylesheets().buildProd
const buildProdStaticAssets = staticAssets().buildProd
const buildProdHtml = html().buildProd
const copyProdScripts = scripts().copyProd
const cacher = cache()
const cacheBust = cacher.cacheBust
const replaceCacheNames = cacher.replaceCacheNames
const removeCacheManifest = cacher.removeCacheManifest
const createAppCache = cacher.createAppCache

module.exports = (taker) => {
  const { applyProdEnv } = env(taker)
  const { cleanProd } = clean(taker)

  const buildProd = taker.series(
    buildProdScripts,
    buildProdStylesheets,
    buildProdStaticAssets,
    buildProdHtml,
    cacheBust,
    replaceCacheNames,
    removeCacheManifest,
    createAppCache
  )

  const runProdServer = taker.series(
    emit('before:serve-prod'),
    () => server().run(config.prodDir)
  )

  const cleanAndBuildProd = taker.series(
    emit('before:build-prod'),
    applyProdEnv, cleanProd, buildProd,
    emit('after:build-prod')
  )

  return {
    buildProdScripts,
    buildProdStylesheets,
    buildProdStaticAssets,
    buildProdHtml,
    copyProdScripts,
    cacheBust,
    replaceCacheNames,
    removeCacheManifest,
    createAppCache,

    buildProd,
    runProdServer,
    cleanAndBuildProd,
  }
}
