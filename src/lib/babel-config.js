const presetEs2015 = require('babel-preset-es2015');
const presetReact = require('babel-preset-react');
const presetStage1 = require('babel-preset-stage-1');

const pluginAddModuleExports = require('babel-plugin-add-module-exports')
const pluginDecorators = require('babel-plugin-transform-decorators-legacy').default;

module.exports = () => ({
  plugins: [pluginDecorators, pluginAddModuleExports],
  presets: [presetEs2015, presetReact, presetStage1],
})
