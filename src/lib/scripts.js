'use strict';

const _ = require('lodash');
const babel = require('gulp-babel');
const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const cjsxify = require('cjsxify');
const gulpif = require('gulp-if');
const fs = require('fs');
const pathUtil = require('path')
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const resolutions = require('browserify-resolutions');
const rev = require('gulp-rev');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const vfs = require('vinyl-fs');
const watchify = require('watchify');

const babelConfig = require('./babel-config');
const handleErrors = require('./handle-errors')('Scripts');
const notifyChanged = require('./notify-changed');
const config = require('./config');
const util = require('./util');

const scriptsGlob = 'src/**/*.+(js|jsx|coffee|cjsx)'
const noSpecsGlob = '!src/**/*.spec.+(js|jsx)'

const babelFileConfig = {
  transform: babelify,
  options: babelConfig(),
};

const coffeeFileConfig = {
  transform: cjsxify,
  options: {},
};

const files = {
  'main.jsx': babelFileConfig,
  'main.js': babelFileConfig,
  'main.cjsx': coffeeFileConfig,
  'main.coffee': coffeeFileConfig,
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
    .pipe(source(config.scriptName))
    .pipe(vfs.dest(destination));
}

function rebundle (bundler, files) {
  files.forEach((path) => notifyChanged({ path }));
  return bundle(bundler, config.devDir);
}

function copy (globOrFile, customErrorHandler = () => null) {
  let file = globOrFile
  let dest = config.testDir

  if (!_.isArray(globOrFile)) {
    file = globOrFile.path
    dest = pathUtil.dirname(file).replace('src', config.testDir).replace(`${__dirname}/`, '')
  }

  return vfs.src(file)
    .pipe(plumber(customErrorHandler(file) || handleErrors))
    .pipe(babel(babelConfig()))
    .pipe(vfs.dest(dest))
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

    copy,

    copyDev () {
      util.logSubTask('copying scripts (dev)');

      return copy([scriptsGlob])
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
        .pipe(source(config.scriptName))
        .pipe(vfs.dest(config.devDir));
    },

    copyProd () {
      util.logSubTask('copying scripts (prod)');

      return copy([scriptsGlob, noSpecsGlob])
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
        .pipe(source(config.scriptName))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulpif(config.cacheBust, rev()))
        .pipe(vfs.dest(config.prodDir))
        .pipe(gulpif(config.cacheBust, rev.manifest()))
        .pipe(gulpif(config.cacheBust, rename('scripts-manifest.json')))
        .pipe(vfs.dest(config.prodDir));
    },
  };
};
