'use strict';

const pathUtil = require('path');
const util = require('./util');

const eventMap = {
  add: 'added',
  change: 'changed',
  unlink: 'removed',
};

module.exports = (prefix, { path, event = 'change' }) => {
  const file = util.colors.magenta.italic(pathUtil.basename(path));
  util.logActionStart(prefix, `${file} was ${eventMap[event]}`);
};
