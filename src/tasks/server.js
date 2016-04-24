'use strict';

const nodemon = require('gulp-nodemon');
const paths = require('../lib/paths');

module.exports = (gulp) => {
  gulp.task('dev-server', () => {
    return nodemon({
      script: `${__dirname}/../lib/run-dev-server.js`,
      watch: [`${process.cwd()}/server`],
      args: [`--devDir=${paths.devDir}`],
    });
  });
};
