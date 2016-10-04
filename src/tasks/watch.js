const { emit } = require('../lib/events')
const html = require('../lib/html');
const scripts = require('../lib/scripts');
const server = require('../lib/server')
const staticAssets = require('../lib/static');
const stylesheets = require('../lib/stylesheets');
const tests = require('../lib/tests')

const env = require('./env')
const clean = require('./clean')

const watchScripts = scripts().watch;
const watchStylesheets = stylesheets().watch;
const watchStaticAssets = staticAssets().watch;
const watchHtml = html().watch;
const watchServer = server().watch;
const watchTests = tests().watch

module.exports = (taker) => {
  const { applyDevEnv } = env(taker)
  const { cleanDev, cleanTests } = clean(taker)

  const watch = taker.series(
    emit('before:watch'),
    applyDevEnv,
    taker.parallel(
      cleanDev,
      cleanTests
    ),
    taker.parallel(
      watchScripts,
      watchTests,
      watchStylesheets,
      watchStaticAssets,
      watchHtml,
      watchServer
    )
  );

  return {
    watchScripts,
    watchStylesheets,
    watchStaticAssets,
    watchHtml,
    watchServer,
    watchTests,

    watch,
  }
}
