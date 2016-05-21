'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch');
const notifyChanged = require('./notify-changed');
const paths = require('./paths');

module.exports = () => {
  function process (file) {
    if (file) notifyChanged(file);
    return gulp.src('static/**/*').pipe(gulp.dest(paths.devDir));
  }

  return {
    watch () {
      watch('static/**/*', process);
      return process();
    },

    buildProd () {
      return gulp.src('static/**/*').pipe(gulp.dest(paths.prodDir));
    },
  };
};
