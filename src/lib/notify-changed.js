'use strict';

const gutil = require('gulp-util');
const pathUtil = require('path');

const eventMap = {
  add: 'added',
  change: 'changed',
  unlink: 'removed',
};

module.exports = ({ path, event = 'change' }) => {
  const file = gutil.colors.magenta(pathUtil.basename(path));
  gutil.log(`${file} was ${eventMap[event]}`);
};
