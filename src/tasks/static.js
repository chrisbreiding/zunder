'use strict';

const watch = require('gulp-watch');
const notifyChanged = require('../lib/notify-changed');
const paths = require('../lib/paths');

module.exports = (gulp) => {
  function process (file) {
    if (file) notifyChanged(file);
    return gulp.src('static/**/*').pipe(gulp.dest(paths.devDir));
  }

  gulp.task('watch-static', () => {
    watch('static/**/*', process);
    return process();
  });

  gulp.task('copy-static', ['clean-prod'], () => {
    return gulp.src('static/**/*').pipe(gulp.dest(paths.prodDir));
  });
};
