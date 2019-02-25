const _ = require('lodash')
const globber = require('node-sass-globbing')

const defaultSassOptions = {
  default: {
    importer: globber,
  },
  dev: {
    sourceComments: true,
    outputStyle: 'expanded',
  },
  prod: {
    outputStyle: 'compressed',
  },
}

const getSassConfigForEnv = (config, env) => {
  return _.extend({}, config.sassOptions.default, config.sassOptions[env])
}

const mergeSassOptions = (newOptions) => {
  return {
    default: _.extend({}, defaultSassOptions.default, newOptions.default),
    dev: _.extend({}, defaultSassOptions.dev, newOptions.dev),
    prod: _.extend({}, defaultSassOptions.prod, newOptions.prod),
  }
}

module.exports = {
  defaultSassOptions,
  getSassConfigForEnv,
  mergeSassOptions,
}
