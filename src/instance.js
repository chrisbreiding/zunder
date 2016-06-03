const _ = require('lodash');
const EventEmitter = require('events');
const paths = require('./lib/paths')
const api = require('./lib/tasks').api;

class Zunder extends EventEmitter {
  constructor (config) {
    super();

    this.config = config;
    _.extend(this, api);
  }
}

module.exports = new Zunder(paths);
