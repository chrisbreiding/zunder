const path = require('path')

const pluginAddModuleExports = {
  module: require.resolve('babel-plugin-add-module-exports'),
  options: {},
}
const pluginProposalObjectRestSpread = {
  module: require.resolve('@babel/plugin-proposal-object-rest-spread'),
  options: {},
}
const pluginProposalDecorators = {
  module: require.resolve('@babel/plugin-proposal-decorators'),
  options: { legacy: true },
}
const pluginProposalClassProperties = {
  module: require.resolve('@babel/plugin-proposal-class-properties'),
  options: { loose: true }, // necessary for decorators
}
const pluginTransformRuntime = {
  module: require.resolve('@babel/plugin-transform-runtime'),
  options: { absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package')) },
}
const presetEnv = {
  module: require.resolve('@babel/preset-env'),
  options: {},
}
const presetReact = {
  module: require.resolve('@babel/preset-react'),
  options: {},
}

const babel = {
  pluginAddModuleExports,
  pluginProposalObjectRestSpread,
  pluginProposalDecorators,
  pluginProposalClassProperties,
  pluginTransformRuntime,
  presetEnv,
  presetReact,

  plugins: [
    [pluginAddModuleExports.module, pluginAddModuleExports.options],
    [pluginProposalObjectRestSpread.module, pluginProposalObjectRestSpread.options],
    [pluginProposalDecorators.module, pluginProposalDecorators.options],
    [pluginProposalClassProperties.module, pluginProposalClassProperties.options],
  ],
  presets: [
    [presetEnv.module, presetEnv.options],
    [presetReact.module, presetReact.options],
  ],
}

const babelConfig = () => ({
  plugins: babel.plugins,
  presets: babel.presets,
})

const pluginTsify = {
  module: require.resolve('tsify'),
  options: {},
}

const transformAliasify = {
  module: require.resolve('aliasify'),
  options: {},
}

const transformBabelify = {
  module: require.resolve('babelify'),
  options: babelConfig(),
}

const transformCoffeeify = {
  module: require.resolve('@cypress/coffeeify'),
  options: {},
}

const transformEnvify = {
  module: require.resolve('envify'),
  options: {},
}

const browserify = {
  pluginTsify,
  transformAliasify,
  transformBabelify,
  transformCoffeeify,
  transformEnvify,

  extensions: ['.js', '.jsx'],
  plugin: [],
  transform: [
    [transformBabelify.module, transformBabelify.options],
    [transformEnvify.module, transformEnvify.options],
  ],
}

const browserifyConfig = () => ({
  extensions: browserify.extensions,
  plugin: browserify.plugin,
  transform: browserify.transform,
})

const watchify = {
  ignoreWatch: [
    '**/package.json',
    '**/.git/**',
    '**/.nyc_output/**',
    '**/.sass-cache/**',
    '**/coverage/**',
    '**/node_modules/**',
  ],
}

module.exports = {
  babel,
  babelConfig,
  browserify,
  browserifyConfig,
  watchify,
}
