'use strict';

const handlebars = require('handlebars');
const through = require('through2');

const util = require('./util');

const PLUGIN_NAME = 'gulp-build-index';

module.exports = (scripts, stylesheets) => {
  return through.obj(function (file, enc, callback) {
    let compiled;

    if (file.isStream()) {
      this.emit('error', new util.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return callback();
    }

    try {
      const template = handlebars.compile(file.contents.toString());
      compiled = template({
        scripts,
        stylesheets,
        env: process.env,
      });
    } catch (error) {
      this.emit('error', new util.PluginError(PLUGIN_NAME, error));
      callback();
      return;
    }

    file.path = util.replaceExtension(file.path, '.html');
    file.contents = new Buffer(compiled);
    this.push(file);

    callback();
  });
};
