'use strict';

const deploy = require('../lib/deploy');
const paths = require('../lib/paths');
const server = require('../lib/server');

module.exports = (gulp) => {
  gulp.task('apply-prod-environment', () => process.env.NODE_ENV = 'production');
  gulp.task('build-prod', ['scripts-prod', 'stylesheets-prod', 'copy-static', 'html-prod']);
  gulp.task('prod', ['build-prod'], () => server(paths.prodDir));
  gulp.task('deploy', ['build-prod'], () => deploy(paths.prodDir));

  gulp.task('watch', ['watch-scripts', 'watch-stylesheets', 'watch-static', 'watch-html', 'dev-server']);
  gulp.task('default', ['watch']);
};
