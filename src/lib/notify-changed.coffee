gutil = require 'gulp-util'
path = require 'path'

eventMap =
  add: 'added'
  change: 'changed'
  unlink: 'removed'

module.exports = (file)->
  gutil.log gutil.colors.magenta(path.basename(file.path)) + " was #{eventMap[file.event]}";
