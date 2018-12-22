const zunder = require('../../../src')

const { browserifyOptions } = zunder.config
browserifyOptions.debug = true

zunder.setConfig({
  browserifyOptions,
  scripts: {
    'src/main.jsx': 'main.js',
    'src/secondary.jsx': 'secondary.js',
  },
})
