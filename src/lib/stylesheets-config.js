const _ = require('lodash')

const getDefaultSassOptions = () => {
  const globber = require('node-sass-glob-importer')

  return {
    default: {
      importer: globber(),
    },
    dev: {
      sourceComments: true,
      outputStyle: 'expanded',
    },
    prod: {
      outputStyle: 'compressed',
    },
  }
}

const getSassConfigForEnv = (config, env) => {
  const sassOptions = config.getSassOptions()

  return _.extend({}, sassOptions.default, sassOptions[env])
}

const mergeSassOptions = (newOptions) => {
  const defaultSassOptions = getDefaultSassOptions()

  return {
    default: _.extend({}, defaultSassOptions.default, newOptions.default),
    dev: _.extend({}, defaultSassOptions.dev, newOptions.dev),
    prod: _.extend({}, defaultSassOptions.prod, newOptions.prod),
  }
}

module.exports = {
  getDefaultSassOptions,
  getSassConfigForEnv,
  mergeSassOptions,
}
