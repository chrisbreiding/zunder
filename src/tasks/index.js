'use strict'

const Undertaker = require('undertaker')

const errors = require('../lib/errors')
const setup = require('../lib/setup')

const taker = new Undertaker()

errors.handleUndertakerErrors(taker)

const cleanTasks = require('./clean')(taker)
const deployTasks = require('./deploy')(taker)
const devTasks = require('./dev')(taker)
const envTasks = require('./env')(taker)
const prodTasks = require('./prod')(taker)
const testTasks = require('./test')(taker)
const watchTasks = require('./watch')(taker)

module.exports = {
  api: {
    undertaker: taker,

    applyDevEnv: envTasks.applyDevEnv,
    applyProdEnv: envTasks.applyProdEnv,
    applyTestEnv: envTasks.applyTestEnv,

    buildDevScripts: devTasks.buildDevScripts,
    buildDevStylesheets: devTasks.buildDevStylesheets,
    buildDevStaticAssets: devTasks.buildDevStaticAssets,
    buildDevHtml: devTasks.buildDevHtml,
    copyDevScripts: devTasks.copyDevScripts,

    buildProdScripts: prodTasks.buildProdScripts,
    buildProdStylesheets: prodTasks.buildProdStylesheets,
    buildProdStaticAssets: prodTasks.buildProdStaticAssets,
    buildProdHtml: prodTasks.buildProdHtml,
    copyProdScripts: prodTasks.copyProdScripts,

    cleanDev: cleanTasks.cleanDev,
    cleanProd: cleanTasks.cleanProd,
    cleanTests: cleanTasks.cleanTests,

    buildTestScripts: testTasks.buildTestScripts,
    runTests: testTasks.runTests,

    watchScripts: watchTasks.watchScripts,
    watchTests: watchTasks.watchTests,
    watchStylesheets: watchTasks.watchStylesheets,
    watchStaticAssets: watchTasks.watchStaticAssets,
    watchHtml: watchTasks.watchHtml,
    watchServer: watchTasks.watchServer,
  },

  cli: {
    clean: cleanTasks.clean,
    deploy: deployTasks.buildAndDeploy,
    'build-dev': devTasks.buildDev,
    'build-prod': prodTasks.cleanAndBuildProd,
    'serve-dev': devTasks.runDevServer,
    'serve-prod': prodTasks.runProdServer,
    setup: setup().run,
    test: testTasks.test,
    watch: watchTasks.watch,
  },
}
