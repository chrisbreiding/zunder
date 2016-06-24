'use strict';

const _ = require('lodash');
const es = require('event-stream');
const watch = require('gulp-watch');
const vfs = require('vinyl-fs');

const notifyChanged = require('./notify-changed');
const config = require('./config');
const util = require('./util');
const { closeOnExit } = require('./exit')

const copy = (globs, dest) => vfs.src(globs).pipe(vfs.dest(dest))

const process = (dest) => (file) => {
  if (file) notifyChanged(file);

  if (_.isArray(config.staticGlobs)) {
    return copy(config.staticGlobs, dest)
  } else {
    const streams = _.map(config.staticGlobs, (dir, glob) => {
      return copy(glob, `${dest}${dir}`);
    })
    return es.merge(streams)
  }
}

module.exports = () => {
  return {
    watch () {
      util.logSubTask('watching static files');

      const watches = _.isArray(config.staticGlobs) ? config.staticGlobs : _.keys(config.staticGlobs)
      const watcher = watch(watches, process(config.devDir));
      process(config.devDir)();

      closeOnExit(watcher);

      return watcher;
    },

    buildProd () {
      util.logSubTask('copying static files');

      return process(config.prodDir)();
    },
  };
};
