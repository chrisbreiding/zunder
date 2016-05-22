'use strict';

const babelify = require('babelify');
const browserify = require('browserify');
const fs = require('fs');
const buffer = require('vinyl-buffer');
const vfs = require('vinyl-fs');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const watchify = require('watchify');

const babelPresetEs2015 = require('babel-preset-es2015');
const babelPresetReact = require('babel-preset-react');

const handleErrors = require('./handle-errors');
const notifyChanged = require('./notify-changed');
const paths = require('./paths');
const util = require('./util');

function getSrcFile () {
  // see if src/main.jsx or src/main.js exists and return
  // appropriate path or throw if neither exists
  let srcFile = './src/main.jsx';
  try {
    fs.readFileSync(`${process.cwd()}/src/main.jsx`);
    return srcFile;
  } catch (e) {
    srcFile = './src/main.js';
    try {
      fs.readFileSync(`${process.cwd()}/src/main.js`);
      return srcFile;
    } catch (e) {
      throw new Error('src/main.jsx or src/main.js must exist');
    }
  }
}

module.exports = () => {
  const entries = [getSrcFile()];
  const extensions = ['.js', '.jsx'];
  const babelOptions = { presets: [babelPresetEs2015, babelPresetReact] };

  function bundle (bundler, destination) {
    return bundler.bundle()
      .on('error', handleErrors)
      .pipe(plumber(handleErrors))
      .pipe(source('app.js'))
      .pipe(vfs.dest(destination));
  }

  function rebundle (bundler, files) {
    files.forEach((path) => notifyChanged({ path }));
    return bundle(bundler, paths.devDir);
  }

  return {
    watch () {
      util.logSubTask('watching scripts');

      const bundler = browserify({
        entries,
        extensions,
        cache: {},
        packageCache: {},
      });

      bundler.transform(babelify, babelOptions)
      watchify(bundler).on('update', (files) => rebundle(bundler, files));
      rebundle(bundler, []);

      return rebundle;
    },

    buildProd () {
      util.logSubTask('building scripts');

      return browserify({ entries, extensions })
        .transform(babelify, babelOptions)
        .bundle()
        .on('error', handleErrors)
        .pipe(plumber(handleErrors))
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rev())
        .pipe(vfs.dest(paths.prodDir))
        .pipe(rev.manifest())
        .pipe(rename('scripts-manifest.json'))
        .pipe(vfs.dest(paths.prodDir));
    },
  };
};
