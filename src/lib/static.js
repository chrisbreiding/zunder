'use strict';

const vfs = require('vinyl-fs');
const watch = require('gulp-watch');

const notifyChanged = require('./notify-changed');
const config = require('./config');
const util = require('./util');

const getSrc = () => (
  config.staticDirs.map((dir) => `${dir}/**/*`)
)

module.exports = () => {
  function process (file) {
    if (file) notifyChanged(file);
    return vfs.src(getSrc()).pipe(vfs.dest(config.devDir));
  }

  return {
    watch () {
      util.logSubTask('watching static files');

      watch(getSrc(), process);
      return process();
    },

    buildProd () {
      util.logSubTask('copying static files');

      return vfs.src(getSrc()).pipe(vfs.dest(config.prodDir));
    },
  };
};
