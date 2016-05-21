'use strict';

const pathUtil = require('path');
const util = require('./util');

const eventMap = {
  add: 'added',
  change: 'changed',
  unlink: 'removed',
};

module.exports = ({ path, event = 'change' }) => {
  const file = util.colors.magenta(pathUtil.basename(path));
  util.log(`${file} was ${eventMap[event]}`);
};
