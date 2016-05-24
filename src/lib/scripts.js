'use strict';

const _ = require('lodash');
const babelify = require('babelify');
const browserify = require('browserify');
const cjsxify = require('cjsxify');
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

const babel = {
  transform: babelify,
  options: { presets: [babelPresetEs2015, babelPresetReact] },
};

const coffee = {
  transform: cjsxify,
  options: {},
};

const files = {
  'main.jsx': babel,
  'main.js': babel,
  'main.cjsx': coffee,
  'main.coffee': coffee,
};

function getSrcConfig () {
  return _.reduce(files, (config, ify, fileName) => {
    if (config) return config;
    try {
      fs.readFileSync(`${process.cwd()}/src/${fileName}`);
    } catch (e) {
      return null;
    }
    return { fileName, ify };
  }, null);
}

module.exports = () => {
  const srcConfig = getSrcConfig();
  if (!srcConfig) {
    util.logError(`One of the following files must exist under src:\n- ${_.keys(files).join('\n- ')}\n`);
    return;
  }
  const entries = [`./src/${srcConfig.fileName}`];
  const extensions = ['.js', '.jsx', '.coffee', '.cjsx'];

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

      bundler.transform(srcConfig.ify.transform, srcConfig.ify.options)
      watchify(bundler).on('update', (files) => rebundle(bundler, files));
      rebundle(bundler, []);

      return rebundle;
    },

    buildProd () {
      util.logSubTask('building scripts');

      return browserify({ entries, extensions })
        .transform(srcConfig.ify.transform, srcConfig.ify.options)
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
