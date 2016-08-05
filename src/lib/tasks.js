'use strict';

const del = require('del');
const Undertaker = require('undertaker');

const deploy = require('./deploy');
const html = require('./html');
const config = require('./config');
const scripts = require('./scripts');
const server = require('./server');
const setup = require('./setup');
const staticAssets = require('./static');
const stylesheets = require('./stylesheets');
const tests = require('./tests')

const instance = require('./instance');
const util = require('./util');

const applyEnv = (env) => (cb) => {
  process.env.NODE_ENV = env;
  cb();
}

const applyDevEnv = applyEnv('development')
const applyProdEnv = applyEnv('production')
const applyTestEnv = applyEnv('test')

const emit = (event) => (cb) => {
  instance.emit(event);
  cb()
}

const taker = new Undertaker();

const errorsReported = {};
taker.on('error', ({ error }) => {
  if (errorsReported[error.message]) return;

  errorsReported[error.message] = true;

  util.logError('Unexpected error:')
  util.log(error.showStack === false ? `${error.plugin}: ${error.message}` : error.stack);
});

const cleanDev = () => del(config.devDir)
const cleanProd = () => del(config.prodDir)
const cleanTests = () => del(config.testDir)
const clean = taker.parallel(
  emit('before:clean'),
  cleanDev, cleanProd, cleanTests,
  emit('after:clean')
);

const buildProdScripts = scripts().buildProd;
const buildProdStylesheets = stylesheets().buildProd;
const buildProdStaticAssets = staticAssets().buildProd;
const buildProdHtml = html().buildProd;

const buildProd = taker.series(
  taker.parallel(buildProdScripts, buildProdStylesheets, buildProdStaticAssets),
  buildProdHtml
);

const runProdServer = taker.series(
  emit('before:serve-prod'),
  () => server().run(config.prodDir)
);

const buildAndDeploy = taker.series(
  emit('before:deploy'),
  applyProdEnv, cleanProd, buildProd, deploy,
  emit('after:deploy')
);

const cleanAndBuildProd = taker.series(
  emit('before:build-prod'),
  applyProdEnv, cleanProd, buildProd,
  emit('after:build-prod')
);

const buildDevScripts = scripts().buildDev
const buildDevStylesheets = stylesheets().buildDev
const buildDevStaticAssets = staticAssets().buildDev
const buildDevHtml = html().buildDev

const runTests = tests().run
const test = taker.series(
  emit('before:test'),
  applyTestEnv, runTests,
  emit('after:test')
)
const watchTests = tests().watch

const watchScripts = scripts().watch;
const watchStylesheets = stylesheets().watch;
const watchStaticAssets = staticAssets().watch;
const watchHtml = html().watch;
const watchServer = server().watch;

const watch = taker.series(
  emit('before:watch'),
  applyDevEnv,
  taker.parallel(
    watchScripts,
    watchTests,
    watchStylesheets,
    watchStaticAssets,
    watchHtml,
    watchServer
  )
);

module.exports = {
  api: {
    undertaker: taker,

    applyDevEnv,
    applyProdEnv,

    buildDevScripts,
    buildDevStylesheets,
    buildDevStaticAssets,
    buildDevHtml,

    buildProdScripts,
    buildProdStylesheets,
    buildProdStaticAssets,
    buildProdHtml,

    cleanDev,
    cleanProd,
    cleanTests,

    runTests,

    watchScripts,
    watchTests,
    watchStylesheets,
    watchStaticAssets,
    watchHtml,
    watchServer,
  },
  cli: {
    clean,
    deploy: buildAndDeploy,
    'build-prod': cleanAndBuildProd,
    'serve-prod': runProdServer,
    setup: setup().run,
    test,
    watch,
  },
};
