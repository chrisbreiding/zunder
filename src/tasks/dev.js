const { emit } = require('../lib/events')
const html = require('../lib/html');
const scripts = require('../lib/scripts');
const staticAssets = require('../lib/static');
const stylesheets = require('../lib/stylesheets');

const env = require('./env')
const clean = require('./clean')

const buildDevScripts = scripts().buildDev
const buildDevStylesheets = stylesheets().buildDev
const buildDevStaticAssets = staticAssets().buildDev
const buildDevHtml = html().buildDev
const copyDevScripts = scripts().copyDev;

module.exports = (taker) => {
  const { applyDevEnv } = env(taker)
  const { cleanDev } = clean(taker)

  const buildDev = taker.series(
    emit('before:build-dev'),
    applyDevEnv,
    cleanDev,
    taker.parallel(
      buildDevScripts,
      buildDevStylesheets,
      buildDevStaticAssets,
      buildDevHtml
    ),
    emit('after:build-dev')
  )

  return {
    buildDevScripts,
    buildDevStylesheets,
    buildDevStaticAssets,
    buildDevHtml,
    copyDevScripts,

    buildDev,
  }
}
