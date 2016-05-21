'use strict';

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const gutil = require('gulp-util');
const minify = require('gulp-clean-css');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const globber = require('node-sass-globbing');

const handleErrors = require('./handle-errors');
const notifyChanged = require('./notify-changed');
const paths = require('./paths');

module.exports = () => {
  const autoprefixOptions = { browsers: ['last 2 versions'], cascade: false };

  let firstTime = true;
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
        if (firstTime) {
          firstTime = false;
          return;
        }
        gutil.log(gutil.colors.green('Stylesheets re-compiled'));
      });
  }

  return {
    watch () {
      watch('src/**/*.scss', process);
      return process();
    },

    buildProd () {
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
    },
  };
};
