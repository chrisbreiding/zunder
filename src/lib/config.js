'use strict'

const _ = require('lodash')
const scriptsConfig = require('./scripts-config')

// these are the default values
// properties are changed and added through instance.setConfig()
const config = {
  appCache: false,
  appCacheTransform: null,
  babelOptions: scriptsConfig.babelConfig(),
  browserifyOptions: scriptsConfig.browserifyConfig(),
  watchifyOptions: scriptsConfig.watchify,
  cacheBust: true,
  cacheFilter: () => true,
  deployBranch: 'gh-pages',
  devDir: 'dist',
  externalBundles: [],
  prodDir: 'dist-prod',
  resolutions: [],
  scripts: {
    'src/main.+(js|jsx|coffee)': 'app.js',
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

// makes stylesheets backwards-compatible with old way of configuring
config.getStylesheets = () => {
  if (!isDefault('stylesheets') || !config.stylesheetGlobs || !config.stylesheetName) return config.stylesheets

  return {
    'src/main.scss': {
      watch: [config.stylesheetGlobs || 'src/**/*.scss'],
      output: config.stylesheetName || 'app.css',
    },
  }
}

module.exports = config
