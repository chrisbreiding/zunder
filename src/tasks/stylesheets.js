'use strict';

const autoprefixer = require('gulp-autoprefixer');
const globber = require('node-sass-globbing');
const gutil = require('gulp-util');
const minify = require('gulp-clean-css');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const sass = require('gulp-sass');
const watch = require('gulp-watch');

const handleErrors = require('../lib/handle-errors');
const notifyChanged = require('../lib/notify-changed');
const paths = require('../lib/paths');

module.exports = (gulp) => {
  const autoprefixOptions = { browsers: ['last 2 versions'], cascade: false };

  function process (file) {
    if (file) notifyChanged(file);
    return gulp.src('src/main.scss')
      .pipe(plumber(handleErrors))
      .pipe(sass({
        importer: globber,
        sourceComments: true,
        outputStyle: 'expanded',
      }))
      .pipe(autoprefixer(autoprefixOptions))
      .pipe(rename('app.css'))
      .pipe(gulp.dest(paths.devDir))
      .on('end', () => {
        gutil.log(gutil.colors.green('Stylesheets re-compiled'));
      });
  }

  gulp.task('watch-stylesheets', () => {
    watch('src/**/*.scss', process);
    return process();
  });

  gulp.task('stylesheets-prod', ['clean-prod'], () => {
    return gulp.src('src/main.scss')
      .pipe(plumber(handleErrors))
      .pipe(sass({
        importer: globber,
        outputStyle: 'compressed',
      }))
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
