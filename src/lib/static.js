'use strict';

const vfs = require('vinyl-fs');
const watch = require('gulp-watch');
const notifyChanged = require('./notify-changed');
const paths = require('./paths');

module.exports = () => {
  function process (file) {
    if (file) notifyChanged(file);
    return vfs.src('static/**/*').pipe(vfs.dest(paths.devDir));
  }

  return {
    watch () {
      watch('static/**/*', process);
      return process();
    },

    buildProd () {
      return vfs.src('static/**/*').pipe(vfs.dest(paths.prodDir));
    },
  };
};
