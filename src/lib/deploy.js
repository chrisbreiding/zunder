'use strict';

const _ = require('lodash');
const fs = require('fs');
const gutil = require('gulp-util');
const RSVP = require('rsvp');

const exec = require('./exec-promise');

module.exports = (dir) => {
  function execInBuild (command) {
    return exec(command, { cwd: dir });
  }

  function log (message) {
    gutil.log(gutil.colors.green(`. ${message}`));
  }

  function initRepo () {
    if (fs.existsSync(`${dir}/.git`)) return RSVP.resolve();

    return exec('git config --get remote.origin.url').then((result) => {
      const url = result.stdout.replace(gutil.linefeed, '');
      return execInBuild('git init').then(() => {
        log('create repo');
        return execInBuild(`git remote add origin ${url}`);
      });
    });
  }

  function checkoutBranch () {
    log('checkout gh-pages branch');
    return execInBuild('git branch').then((result) => {
      const branchExists = _.any(result.stdout.split('\n'), (branch) => {
        return /gh\-pages/.test(branch);
      });
      const flag = branchExists ? '' : '-b';
      return execInBuild(`git checkout ${flag} gh-pages`);
    });
  }

  function addAll () {
    log('add all files');
    return execInBuild('git add -A');
  }

  function commit () {
    log('commit');
    const commitMessage = `automated commit by deployment at ${new Date().toUTCString()}`;
    return execInBuild(`git commit --allow-empty -am '${commitMessage}'`);
  }

  function push () {
    log('push to gh-pages branch');
    return execInBuild('git push -f origin gh-pages');
  }

  return initRepo()
    .then(checkoutBranch)
    .then(addAll)
    .then(commit)
    .then(push)
    .catch(error => { throw error });
};
