'use strict'

const _ = require('lodash')
const scriptsConfig = require('./scripts-config')
const stylesheetsConfig = require('./stylesheets-config')

// these are the default values
// properties are changed and added through instance.setConfig()
const config = {
  addBrowserifyConfigTo: [],
  appCache: false,
  appCacheTransform: null,
  browserifyOptions: scriptsConfig.browserifyConfig(),
  cacheBust: true,
  cacheFilter: () => true,
  deployBranch: 'gh-pages',
  devDir: 'dist',
  externalBundles: [],
  prodDir: 'dist-prod',
  resolutions: [],
  sassOptions: stylesheetsConfig.defaultOptions,
  scripts: {
    'src/main.+(js|jsx)': 'app.js',
  },
  stylesheets: {
    'src/main.scss': {
      watch: ['src/**/*.scss'],
      output: 'app.css',
    },
  },
  stylesheetGlobs: null,
  stylesheetName: 'app.css',
  staticGlobs: ['static/**'],
  testDir: 'dist-test',
  testSetup: 'lib/test-setup.js',
  watchifyOptions: scriptsConfig.watchify,
}

const defaults = JSON.parse(JSON.stringify(config))
const isDefault = (configKey) => {
  return _.isEqual(config[configKey], defaults[configKey])
}

// makes scripts backwards-compatible with old way of configuring
config.getScripts = () => {
  if (isDefault('scripts') || !config.scriptName) return config.scripts

  return {
    'src/main.+(js|jsx|coffee)': config.scriptName,
  }
}

// makes stylesheets backwards-compatible with old way of configuring
config.getStylesheets = () => {
  if (isDefault('stylesheets') || !config.stylesheetGlobs || !config.stylesheetName) return config.stylesheets

  return {
    'src/main.scss': {
      watch: [config.stylesheetGlobs || 'src/**/*.scss'],
      output: config.stylesheetName || 'app.css',
    },
  }
}

module.exports = config
