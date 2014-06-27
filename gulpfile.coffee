gulp = require 'gulp'
coffee = require 'gulp-coffee'

gulp.task 'watch', ->
  gulp.watch 'src/**/*', ['src']

gulp.task 'src', ->
  gulp.src 'src/**/*'
    .pipe coffee()
    .pipe gulp.dest '../zunder-test/node_modules/zunder/dist/'
