'use strict'

const _ = require('lodash')

// these are the default values
// properties are changed and added through instance.setConfig()
const config = {
  appCache: false,
  appCacheTransform: null,
  cacheBust: true,
  cacheFilter: () => true,
  deployBranch: 'gh-pages',
  devDir: 'dist',
  externalBundles: [],
  prodDir: 'dist-prod',
  scripts: {
    'src/main.+(js|jsx|coffee)': 'app.js',
  },
  stylesheetGlobs: null,
  stylesheetName: 'app.css',
  resolutions: [],
  staticGlobs: ['static/**'],
  testDir: 'dist-test',
  testSetup: 'lib/test-setup.js',
}

const defaults = JSON.parse(JSON.stringify(config))
const isDefault = (configKey) => {
  return _.isEqual(config[configKey], defaults[configKey])
}

// makes scripts backwards-compatible with old way of configuring
config.getScripts = () => {
  if (!isDefault('scripts') || !config.scriptName) return config.scripts

  return {
    'src/main.+(js|jsx|coffee)': config.scriptName,
  }
}

module.exports = config
