'use strict';

const gutil = require('gulp-util');
const handlebars = require('handlebars');
const through = require('through2');

const PLUGIN_NAME = 'gulp-build-index';

module.exports = (scripts, stylesheets) => {
  return through.obj(function (file, enc, callback) {
    let compiled;

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return callback();
    }

    try {
      const template = handlebars.compile(file.contents.toString());
      compiled = template({
        scripts,
        stylesheets,
      });
    } catch (error) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, error));
      callback();
      return;
    }

    file.path = gutil.replaceExtension(file.path, '.html');
    file.contents = new Buffer(compiled);
    this.push(file);

    callback();
  });
};
