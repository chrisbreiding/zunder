'use strict'

// these are the default values
// properties are changed and added through instance.setConfig()
module.exports = {
  appCache: false,
  appCacheTransform: null,
  cacheBust: true,
  cacheFilter: () => true,
  deployBranch: 'gh-pages',
  devDir: 'dist',
  externalBundles: [],
  prodDir: 'dist-prod',
  scriptName: 'app.js',
  stylesheetGlobs: null,
  stylesheetName: 'app.css',
  resolutions: [],
  staticGlobs: ['static/**'],
  testDir: 'dist-test',
  testSetup: 'lib/test-setup.js',
}
