'use strict';

const vfs = require('vinyl-fs');
const watch = require('gulp-watch');

const notifyChanged = require('./notify-changed');
const paths = require('./paths');
const util = require('./util');

module.exports = () => {
  function process (file) {
    if (file) notifyChanged(file);
    return vfs.src('static/**/*').pipe(vfs.dest(paths.devDir));
  }

  return {
    watch () {
      util.logSubTask('watching static files');

      watch('static/**/*', process);
      return process();
    },

    buildProd () {
      util.logSubTask('copying static files');

      return vfs.src('static/**/*').pipe(vfs.dest(paths.prodDir));
    },
  };
};
