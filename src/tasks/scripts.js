'use strict';

const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const watchify = require('watchify');

const babelPresetEs2015 = require('babel-preset-es2015');
const babelPresetReact = require('babel-preset-react');

const handleErrors = require('../lib/handle-errors');
const notifyChanged = require('../lib/notify-changed');
const paths = require('../lib/paths');

module.exports = (gulp, config) => {
  const entries = [`./src/${config.srcFile}`];
  const extensions = ['.js', '.jsx'];
  const babelOptions = { presets: [babelPresetEs2015, babelPresetReact] };

  function bundle (bundler, destination) {
    return bundler.bundle()
      .on('error', handleErrors)
      .pipe(plumber(handleErrors))
      .pipe(source('app.js'))
      .pipe(gulp.dest(destination));
  }

  function rebundle (bundler, files) {
    files.forEach(path => notifyChanged({ path }));
    return bundle(bundler, paths.devDir);
  }

  gulp.task('watch-scripts', () => {
    const bundler = browserify({
      entries: entries,
      extensions: extensions,
      cache: {},
      packageCache: {},
    });

    bundler.transform(babelify, babelOptions)
    watchify(bundler).on('update', (files) => rebundle(bundler, files));
    rebundle(bundler, []);

    return rebundle;
  });

  gulp.task('scripts-prod', ['apply-prod-environment'], () => {
    return browserify({ entries, extensions })
      .transform(babelify, babelOptions)
      .bundle()
      .on('error', handleErrors)
      .pipe(plumber(handleErrors))
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(rev())
      .pipe(gulp.dest(paths.prodDir))
      .pipe(rev.manifest())
      .pipe(rename('scripts-manifest.json'))
      .pipe(gulp.dest(paths.prodDir));
  });
};
