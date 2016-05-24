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

function applyProdEnv (cb) {
  process.env.NODE_ENV = 'production';
  cb();
}

const taker = new Undertaker();

module.exports = () => {
  const cleanDev = () => del(paths.devDir)
  const cleanProd = () => del(paths.prodDir)
  const clean = taker.parallel(cleanDev, cleanProd);

  const buildProd = taker.series(
    taker.parallel(
      scripts().buildProd,
      stylesheets().buildProd,
      staticAssets().buildProd
    ),
    html().buildProd
  );

  const runProdServer = () => server().run(paths.prodDir, args.port);

  const buildAndDeploy = taker.series(applyProdEnv, cleanProd, buildProd, deploy);
  const cleanAndBuildProd = taker.series(applyProdEnv, cleanProd, buildProd);

  const watch = taker.parallel(
    scripts().watch,
    stylesheets().watch,
    staticAssets().watch,
    html().watch,
    server().watch
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
