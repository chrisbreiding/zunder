const fs = require('fs');
const watch = require('gulp-watch');
const vfs = require('vinyl-fs');

const build = require('./build-index');
const notifyChanged = require('./notify-changed');
const paths = require('./paths');

function process (file) {
  if (file) notifyChanged(file);
  return vfs.src('src/index.hbs')
    .pipe(build(['app.js'], ['app.css']))
    .pipe(vfs.dest(paths.devDir));
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

      return vfs.src('src/index.hbs')
        .pipe(build([scriptName], [stylesheetName]))
        .pipe(vfs.dest(paths.prodDir));
    },
  };
};
