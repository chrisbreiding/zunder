'use strict';

const vfs = require('vinyl-fs');
const watch = require('gulp-watch');

const notifyChanged = require('./notify-changed');
const config = require('./config');
const util = require('./util');

module.exports = () => {
  function process (file) {
    if (file) notifyChanged(file);
    return vfs.src(config.staticGlobs).pipe(vfs.dest(config.devDir));
  }

  return {
    watch () {
      util.logSubTask('watching static files');

      watch(config.staticGlobs, process);
      return process();
    },

    buildProd () {
      util.logSubTask('copying static files');

      return vfs.src(config.staticGlobs).pipe(vfs.dest(config.prodDir));
    },
  };
};
