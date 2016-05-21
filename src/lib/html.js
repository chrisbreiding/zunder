const fs = require('fs');
const gulp = require('gulp');
const watch = require('gulp-watch');

const build = require('./build-index');
const notifyChanged = require('./notify-changed');
const paths = require('./paths');

function process (file) {
  if (file) notifyChanged(file);
  return gulp.src('src/index.hbs')
    .pipe(build(['app.js'], ['app.css']))
    .pipe(gulp.dest(paths.devDir));
}

module.exports = () => {
  return {
    watch () {
      watch('src/index.hbs', process);
      return process();
    },

    buildProd () {
      const scriptsManifest = `${paths.prodDir}/scripts-manifest.json`;
      const stylesheetsManifest = `${paths.prodDir}/stylesheets-manifest.json`;

      const scriptName = JSON.parse(fs.readFileSync(scriptsManifest))['app.js'];
      const stylesheetName = JSON.parse(fs.readFileSync(stylesheetsManifest))['app.css'];

      fs.unlinkSync(scriptsManifest);
      fs.unlinkSync(stylesheetsManifest);

      return gulp.src('src/index.hbs')
      .pipe(build([scriptName], [stylesheetName]))
      .pipe(gulp.dest(paths.prodDir));
    },
  };
};
