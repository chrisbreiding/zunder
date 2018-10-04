const path = require('path')
const zunder = require('../../../src')

zunder.setConfig({
  addBrowserifyConfigTo: [
    path.join(__dirname, '..', 'node_modules', 'chai'),
  ],
})
