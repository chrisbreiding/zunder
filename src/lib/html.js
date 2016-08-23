const fs = require('fs');
const watch = require('gulp-watch');
const vfs = require('vinyl-fs');

const build = require('./build-index');
const notifyChanged = require('./notify-changed');
const config = require('./config');
const util = require('./util');
const { closeOnExit } = require('./exit')

function process (file) {
  if (file) notifyChanged(file);
  return vfs.src('src/*.hbs')
    .pipe(build([config.scriptName], [config.stylesheetName]))
    .pipe(vfs.dest(config.devDir));
}

module.exports = () => {
  return {
    watch () {
      util.logSubTask('watching hbs files');

      const watcher = watch('src/*.hbs', process);
      process();

      closeOnExit(watcher);

      return watcher;
    },

    buildDev () {
      util.logSubTask('building hbs files (dev)');

      process();
    },

    buildProd () {
      util.logSubTask('building hbs files');

      const scriptsManifest = `${config.prodDir}/scripts-manifest.json`;
      const stylesheetsManifest = `${config.prodDir}/stylesheets-manifest.json`;

      const scriptName = JSON.parse(fs.readFileSync(scriptsManifest))[config.scriptName];
      const stylesheetName = JSON.parse(fs.readFileSync(stylesheetsManifest))[config.stylesheetName];

      fs.unlinkSync(scriptsManifest);
      fs.unlinkSync(stylesheetsManifest);

      return vfs.src('src/index.hbs')
        .pipe(build([scriptName], [stylesheetName]))
        .pipe(vfs.dest(config.prodDir));
    },
  };
};
