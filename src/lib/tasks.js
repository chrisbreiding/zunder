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

module.exports = () => {
  const cleanDev = () => del(paths.devDir)
  const cleanProd = () => del(paths.prodDir)
  const clean = taker.parallel(
    emit('before:clean'),
    cleanDev, cleanProd,
    emit('after:clean')
  );

  const buildProd = taker.series(
    taker.parallel(
      scripts().buildProd,
      stylesheets().buildProd,
      staticAssets().buildProd
    ),
    html().buildProd
  );

  const runProdServer = taker.series(
    emit('before:serve-prod'),
    () => server().run(paths.prodDir, args.port)
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

  const watch = taker.series(
    emit('before:watch'),
    taker.parallel(
      scripts().watch,
      stylesheets().watch,
      staticAssets().watch,
      html().watch,
      server().watch
    )
  );

  return {
    clean,
    deploy: buildAndDeploy,
    'build-prod': cleanAndBuildProd,
    'serve-prod': runProdServer,
    setup: setup().run,
    watch,
  };
};
