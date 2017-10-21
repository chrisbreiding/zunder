const presetEnv = require('babel-preset-env')
const presetReact = require('babel-preset-react')
const presetStage1 = require('babel-preset-stage-1')

const pluginAddModuleExports = require('babel-plugin-add-module-exports')
const pluginDecorators = require('babel-plugin-transform-decorators-legacy').default

module.exports = () => ({
  plugins: [pluginDecorators, pluginAddModuleExports],
  presets: [presetEnv, presetReact, presetStage1],
})
