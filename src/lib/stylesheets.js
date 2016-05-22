'use strict';

const vfs = require('vinyl-fs');
const autoprefixer = require('gulp-autoprefixer');
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
const util = require('./util');

module.exports = () => {
  const autoprefixOptions = { browsers: ['last 2 versions'], cascade: false };

  let firstTime = true;
  function process (file) {
    if (file) notifyChanged(file);
    return vfs.src('src/main.scss')
      .pipe(plumber(handleErrors))
      .pipe(sass({
        importer: globber,
        sourceComments: true,
        outputStyle: 'expanded',
      }))
      .pipe(autoprefixer(autoprefixOptions))
      .pipe(rename('app.css'))
      .pipe(vfs.dest(paths.devDir))
      .on('end', () => {
        if (firstTime) {
          firstTime = false;
          return;
        }
        util.log(util.colors.green('Stylesheets re-compiled'));
      });
  }

  return {
    watch () {
      util.logSubTask('watching stylesheets');

      watch('src/**/*.scss', process);
      return process();
    },

    buildProd () {
      util.logSubTask('building stylesheets');

      return vfs.src('src/main.scss')
        .pipe(plumber(handleErrors))
        .pipe(sass({
          importer: globber,
          outputStyle: 'compressed',
        }))
        .pipe(autoprefixer(autoprefixOptions))
        .pipe(minify())
        .pipe(rename('app.css'))
        .pipe(rev())
        .pipe(vfs.dest(paths.prodDir))
        .pipe(rev.manifest())
        .pipe(rename('stylesheets-manifest.json'))
        .pipe(vfs.dest(paths.prodDir));
    },
  };
};
