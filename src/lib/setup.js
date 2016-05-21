'use strict';

const fs = require('fs');

const _ = require('lodash');
const gutil = require('gulp-util');
const globSync = require('glob').sync;
const RSVP = require('rsvp');

const exec = require('./exec-promise');
const promisify = require('./promisify');

const mkdirp = promisify(require('mkdirp'));
const readFile = promisify(fs.readFile);

module.exports = () => {
  const devDeps = ['eslint', 'eslint-plugin-react'];
  const deps = ['react', 'react-dom'];

  return {
    run () {
      const scaffoldDir = __dirname.replace('lib', 'scaffold');

      const scaffolds = _(globSync(`${scaffoldDir}/**/*`, { dot: true }))
        .map((filePath) => filePath.replace(`${scaffoldDir}/`, ''))
        .reject((filePath) => filePath.indexOf('.DS_Store') > -1)
        .value();

      const files = _.filter(scaffolds, (filePath) => {
        return /\/?[-_A-Za-z]*\.\w+$/.test(filePath);
      });

      const directories = _.reject(scaffolds, (filePath) => {
        return _.includes(files, filePath);
      });

      return RSVP.Promise.resolve()
        .then(() => {
          gutil.log('installing dev dependencies');
          devDeps.forEach((dep) => gutil.log(`- ${dep}`));
          exec(`npm install --save-dev ${devDeps.join(' ')} --progress=false`)
        })
        .then(() => {
          gutil.log('installing dependencies');
          deps.forEach((dep) => gutil.log(`- ${dep}`));
          return exec(`npm install --save ${deps.join(' ')} --progress=false`)
        })
        .then(() => {
          gutil.log('scaffolding files');
          return RSVP.all(directories.map((directory) => mkdirp(directory)));
        })
        .then(() => {
          return RSVP.all(files.map((file) => {
            return readFile(file).catch(() => {
               // erroring indicates the file doesn't exist
               // which is the only case where the scaffold should go in place
              gutil.log(`- ${file}`);
              return fs.createReadStream(`${__dirname}/../scaffold/${file}`)
                .pipe(fs.createWriteStream(file));
            });
          }));
        })
        .catch((err) => { throw err });
    },
  };
};
