'use strict';

const _ = require('lodash');
const babelify = require('babelify');
const browserify = require('browserify');
const resolutions = require('browserify-resolutions');
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
const babelPresetStage1 = require('babel-preset-stage-1');
const babelPluginDecorators = require('babel-plugin-transform-decorators-legacy').default;

const handleErrors = require('./handle-errors');
const notifyChanged = require('./notify-changed');
const config = require('./config');
const util = require('./util');

const babel = {
  transform: babelify,
  options: {
    plugins: [babelPluginDecorators],
    presets: [babelPresetEs2015, babelPresetReact, babelPresetStage1],
  },
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
  const config = _.reduce(files, (config, ify, fileName) => {
    if (config) return config;
    try {
      fs.readFileSync(`${process.cwd()}/src/${fileName}`);
    } catch (e) {
      return null;
    }
    return { fileName, ify };
  }, null);

  if (!config) {
    util.logError(`One of the following files must exist under src:\n- ${_.keys(files).join('\n- ')}\n`);
    return;
  }

  return {
    entries: [`./src/${config.fileName}`],
    ify: config.ify,
  };
}

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
  return bundle(bundler, config.devDir);
}

module.exports = () => {
  return {
    watch () {
      util.logSubTask('watching scripts');

      const { entries, ify } = getSrcConfig();
      const bundler = browserify({
        entries,
        extensions,
        cache: {},
        packageCache: {},
      });

      bundler
        .plugin(resolutions, config.resolutions)
        .transform(ify.transform, ify.options);
      watchify(bundler).on('update', (files) => rebundle(bundler, files));
      rebundle(bundler, []);

      return rebundle;
    },

    buildDev () {
      util.logSubTask('building scripts (dev)');

      const { entries, ify } = getSrcConfig();
      return browserify({ entries, extensions })
        .plugin(resolutions, '*')
        .transform(ify.transform, ify.options)
        .bundle()
        .on('error', handleErrors)
        .pipe(plumber(handleErrors))
        .pipe(source('app.js'))
        .pipe(vfs.dest(config.devDir));
    },

    buildProd () {
      util.logSubTask('building scripts');

      const { entries, ify } = getSrcConfig();
      return browserify({ entries, extensions })
        .plugin(resolutions, '*')
        .transform(ify.transform, ify.options)
        .bundle()
        .on('error', handleErrors)
        .pipe(plumber(handleErrors))
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rev())
        .pipe(vfs.dest(config.prodDir))
        .pipe(rev.manifest())
        .pipe(rename('scripts-manifest.json'))
        .pipe(vfs.dest(config.prodDir));
    },
  };
};
