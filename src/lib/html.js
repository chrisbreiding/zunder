const fs = require('fs');
const watch = require('gulp-watch');
const vfs = require('vinyl-fs');

const build = require('./build-index');
const notifyChanged = require('./notify-changed');
const config = require('./config');
const util = require('./util');

function process (file) {
  if (file) notifyChanged(file);
  return vfs.src('src/*.hbs')
    .pipe(build(['app.js'], ['app.css']))
    .pipe(vfs.dest(config.devDir));
}

module.exports = () => {
  return {
    watch () {
      util.logSubTask('watching hbs files');

      watch('src/*.hbs', process);
      return process();
    },

    buildProd () {
      util.logSubTask('building hbs files');

      const scriptsManifest = `${config.prodDir}/scripts-manifest.json`;
      const stylesheetsManifest = `${config.prodDir}/stylesheets-manifest.json`;

      const scriptName = JSON.parse(fs.readFileSync(scriptsManifest))['app.js'];
      const stylesheetName = JSON.parse(fs.readFileSync(stylesheetsManifest))['app.css'];

      fs.unlinkSync(scriptsManifest);
      fs.unlinkSync(stylesheetsManifest);

      return vfs.src('src/index.hbs')
        .pipe(build([scriptName], [stylesheetName]))
        .pipe(vfs.dest(config.prodDir));
    },
  };
};
