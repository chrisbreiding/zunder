'use strict';

const autoprefixer = require('gulp-autoprefixer');
const gutil = require('gulp-util');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const stylus = require('gulp-stylus');
const minify = require('gulp-clean-css');
const rev = require('gulp-rev');
const rename = require('gulp-rename');

const handleErrors = require('../lib/handle-errors');
const notifyChanged = require('../lib/notify-changed');
const paths = require('../lib/paths');

module.exports = (gulp) => {
  const autoprefixOptions = { browsers: ['last 2 versions'], cascade: false };

  function process (file) {
    if (file) notifyChanged(file);
    return gulp.src('src/main.styl')
      .pipe(plumber(handleErrors))
      .pipe(stylus({ linenos: true }))
      .pipe(autoprefixer(autoprefixOptions))
      .pipe(rename('app.css'))
      .pipe(gulp.dest(paths.devDir))
      .on('end', () => {
        gutil.log(gutil.colors.green('Stylesheets re-compiled'));
      });
  }

  gulp.task('watch-stylesheets', () => {
    watch('src/**/*.styl', process);
    return process();
  });

  gulp.task('stylesheets-prod', ['clean-prod'], () => {
    return gulp.src('src/main.styl')
      .pipe(plumber(handleErrors))
      .pipe(stylus())
      .pipe(autoprefixer(autoprefixOptions))
      .pipe(minify())
      .pipe(rename('app.css'))
      .pipe(rev())
      .pipe(gulp.dest(paths.prodDir))
      .pipe(rev.manifest())
      .pipe(rename('stylesheets-manifest.json'))
      .pipe(gulp.dest(paths.prodDir));
  });
};
