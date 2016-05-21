'use strict';

const gulp = require('gulp');
const del = require('del');

const { getConfig } = require('./config');
const deploy = require('./deploy');
const html = require('./html');
const paths = require('./paths');
const scripts = require('./scripts');
const server = require('./server');
const setup = require('./setup');
const staticAssets = require('./static');
const stylesheets = require('./stylesheets');

module.exports = () => {
  return getConfig().then((config) => {
    // clean
    gulp.task('clean-dev', () => del(paths.devDir));
    gulp.task('clean-prod', () => del(paths.prodDir));
    gulp.task('clean', ['clean-dev', 'clean-prod']);

    // html
    gulp.task('watch-html', html().watch);
    gulp.task('html-prod', ['scripts-prod', 'stylesheets-prod'], html().buildProd);

    // scripts
    gulp.task('watch-scripts', scripts(config).watch);
    gulp.task('scripts-prod', ['apply-prod-environment'], scripts(config).buildProd);

    // server
    gulp.task('dev-server', server().watch);

    // static
    gulp.task('watch-static', staticAssets().watch);
    gulp.task('copy-static', ['clean-prod'], staticAssets().buildProd);

    // scaffolding
    gulp.task('setup', setup().run);

    // stylesheets
    gulp.task('watch-stylesheets', stylesheets().watch);
    gulp.task('stylesheets-prod', ['clean-prod'], stylesheets().buildProd);

    // watch
    gulp.task('watch', ['watch-scripts', 'watch-stylesheets', 'watch-static', 'watch-html', 'dev-server']);

    // prod
    gulp.task('apply-prod-environment', () => process.env.NODE_ENV = 'production');
    gulp.task('build-prod', ['scripts-prod', 'stylesheets-prod', 'copy-static', 'html-prod']);
    gulp.task('build', ['build-prod'], () => server().run(paths.prodDir));
    gulp.task('deploy', ['build-prod'], () => deploy(paths.prodDir));

    return {
      clean () { gulp.start('clean'); },
      deploy () { gulp.start('deploy'); },
      build () { gulp.start('build'); },
      setup () { gulp.start('setup'); },
      watch () { gulp.start('watch'); },
    };
  });
};
