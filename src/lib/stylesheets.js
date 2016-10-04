'use strict';

const fs = require('fs');
const autoprefixer = require('gulp-autoprefixer');
const gulpif = require('gulp-if');
const minify = require('gulp-clean-css');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const sass = require('gulp-sass');
const stylus = require('gulp-stylus');
const watch = require('gulp-watch');
const _ = require('lodash');
const globber = require('node-sass-globbing');
const vfs = require('vinyl-fs');

const handleErrors = require('./errors').createTaskErrorHandler('Stylesheets');
const notifyChanged = require('./notify-changed');
const config = require('./config');
const util = require('./util');
const { closeOnExit } = require('./exit')

const files = {
  'main.styl': {
    watch: 'src/**/*.styl',
    dev: () => stylus({ linenos: true }),
    prod: () => stylus(),
  },
  'main.scss': {
    watch: 'src/**/*.scss',
    dev: () => sass({
      importer: globber,
      sourceComments: true,
      outputStyle: 'expanded',
    }),
    prod: () => sass({
      importer: globber,
      outputStyle: 'compressed',
    }),
  },
};

function getSrcConfig () {
  const srcConfig = _.reduce(files, (srcConfig, compiler, fileName) => {
    if (srcConfig) return srcConfig;
    try {
      fs.readFileSync(`${process.cwd()}/src/${fileName}`);
    } catch (e) {
      return null;
    }
    return { fileName, compiler };
  }, null);

  if (!srcConfig) {
    util.logError(`One of the following files must exist under src:\n- ${_.keys(files).join('\n- ')}\n`);
    return;
  }

  return srcConfig;
}

module.exports = () => {
  const autoprefixOptions = { browsers: ['last 2 versions'], cascade: false };

  let firstTime = true;
  function process (srcConfig, file) {
    if (file) notifyChanged(file);
    return vfs.src(`src/${srcConfig.fileName}`)
      .pipe(plumber(handleErrors))
      .pipe(srcConfig.compiler.dev())
      .pipe(autoprefixer(autoprefixOptions))
      .pipe(rename(config.stylesheetName))
      .pipe(vfs.dest(config.devDir))
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

      const srcConfig = getSrcConfig();
      const watcher = watch(srcConfig.compiler.watch, _.partial(process, srcConfig));
      process(srcConfig);

      closeOnExit(watcher);

      return watcher;
    },

    buildDev () {
      util.logSubTask('building stylesheets (dev)');

      const srcConfig = getSrcConfig();
      process(srcConfig);
    },

    buildProd () {
      util.logSubTask('building stylesheets');

      const srcConfig = getSrcConfig();
      return vfs.src(`src/${srcConfig.fileName}`)
        .pipe(plumber(handleErrors))
        .pipe(srcConfig.compiler.prod())
        .pipe(autoprefixer(autoprefixOptions))
        .pipe(minify())
        .pipe(rename(config.stylesheetName))
        .pipe(gulpif(config.cacheBust, rev()))
        .pipe(vfs.dest(config.prodDir))
        .pipe(gulpif(config.cacheBust, rev.manifest()))
        .pipe(gulpif(config.cacheBust, rename('stylesheets-manifest.json')))
        .pipe(vfs.dest(config.prodDir));
    },
  };
};
