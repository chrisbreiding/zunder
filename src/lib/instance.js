'use strict'

const _ = require('lodash');
const EventEmitter = require('events');
const api = require('../tasks').api;
const config = require('./config')

class Zunder extends EventEmitter {
  constructor () {
    super();

    // store config on instance so it's available in zunderfile
    this.config = config;
    _.extend(this, api);
  }

  setConfig (props) {
    _.extend(config, props)
    this.config = config
  }
}

module.exports = new Zunder();
