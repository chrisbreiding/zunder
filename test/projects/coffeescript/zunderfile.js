const zunder = require('../../../src')

const { browserifyOptions } = zunder.config
browserifyOptions.extensions.push('.coffee')
browserifyOptions.transform.push([
  zunder.defaults.browserify.transformCoffeeify.module,
])

zunder.setConfig({
  browserifyOptions,
})
