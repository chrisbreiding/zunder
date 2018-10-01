'use strict'

const _ = require('lodash')
const EventEmitter = require('events')
const api = require('../tasks').api
const config = require('./config')
const scriptsConfig = require('./scripts-config')

class Zunder extends EventEmitter {
  constructor () {
    super()

    // store config on instance so it's available in zunderfile
    this.config = config
    this.defaults = {
      babel: scriptsConfig.babel,
      browserify: scriptsConfig.browserify,
      watchify: scriptsConfig.watchify,
    }
    _.extend(this, api)
  }

  setConfig (props) {
    if (props.resolutions) {
      // eslint-disable-next-line no-console
      console.warn('Setting resolutions is deprecated in zunder 6 and will be removed in zunder 7. Use aliasify instead.')
    }

    _.extend(config, props)
    this.config = config
  }
}

module.exports = new Zunder()
