'use strict';

const del = require('del');
const Undertaker = require('undertaker');
const args = require('yargs').argv;

const deploy = require('./deploy');
const html = require('./html');
const paths = require('./paths');
const scripts = require('./scripts');
const server = require('./server');
const setup = require('./setup');
const staticAssets = require('./static');
const stylesheets = require('./stylesheets');

const instance = require('../instance');

function applyProdEnv (cb) {
  process.env.NODE_ENV = 'production';
  cb();
}

const emit = (event) => (cb) => {
  instance.emit(event);
  cb()
}

const taker = new Undertaker();

const cleanDev = () => del(paths.devDir)
const cleanProd = () => del(paths.prodDir)
const clean = taker.parallel(
  emit('before:clean'),
  cleanDev, cleanProd,
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
  () => server().run(paths.prodDir)
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

const watchScripts = scripts().watch;
const watchStylesheets = stylesheets().watch;
const watchStaticAssets = staticAssets().watch;
const watchHtml = html().watch;
const watchServer = server().watch;

const watch = taker.series(
  emit('before:watch'),
  taker.parallel(watchScripts, watchStylesheets, watchStaticAssets, watchHtml, watchServer)
);

module.exports = {
  api: {
    undertaker: taker,

    applyProdEnv,

    buildProdScripts,
    buildProdStylesheets,
    buildProdStaticAssets,
    buildProdHtml,

    cleanDev,
    cleanProd,

    watchScripts,
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
    watch,
  },
};
