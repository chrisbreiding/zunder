const { emit } = require('../lib/events')
const config = require('../lib/config')
const html = require('../lib/html')
const server = require('../lib/server')
const scripts = require('../lib/scripts')
const staticAssets = require('../lib/static')
const stylesheets = require('../lib/stylesheets')

const env = require('./env')
const clean = require('./clean')

const buildDevScripts = scripts().buildDev
const buildDevStylesheets = stylesheets().buildDev
const buildDevStaticAssets = staticAssets().buildDev
const buildDevHtml = html().buildDev
const copyDevScripts = scripts().copyDev

module.exports = (taker) => {
  const { applyDevEnv } = env(taker)
  const { cleanDev } = clean(taker)

  const buildDev = taker.series(
    emit('before:build-dev'),
    applyDevEnv,
    cleanDev,
    buildDevScripts,
    buildDevStylesheets,
    buildDevStaticAssets,
    buildDevHtml,
    emit('after:build-dev')
  )

  const runDevServer = taker.series(
    emit('before:serve-prod'),
    () => server().run(config.devDir)
  )

  return {
    buildDevScripts,
    buildDevStylesheets,
    buildDevStaticAssets,
    buildDevHtml,
    copyDevScripts,

    buildDev,
    runDevServer,
  }
}
