const EventEmitter = require('events');
const paths = require('./lib/paths')

class ZunderEmitter extends EventEmitter {}

const instance = new ZunderEmitter();

instance.config = paths;

module.exports = instance;
