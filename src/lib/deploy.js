'use strict';

const _ = require('lodash');
const fs = require('fs');
const RSVP = require('rsvp');

const exec = require('./exec-promise');
const paths = require('./paths');
const util = require('./util');

module.exports = () => {
  const dir = paths.prodDir;

  function execInBuild (command) {
    return exec(command, { cwd: dir });
  }

  function log (message) {
    util.logSubTask(`. ${message}`);
  }

  function initRepo () {
    if (fs.existsSync(`${dir}/.git`)) return RSVP.resolve();

    return exec('git config --get remote.origin.url').then((result) => {
      const url = result.stdout.replace(util.linefeed, '');
      return execInBuild('git init').then(() => {
        log('create repo');
        return execInBuild(`git remote add origin ${url}`);
      });
    });
  }

  function checkoutBranch () {
    return execInBuild('git branch').then((result) => {
      const branchExists = _.some(result.stdout.split('\n'), (branch) => {
        return /gh\-pages/.test(branch);
      });
      const flag = branchExists ? '' : '-b';
      log('checkout gh-pages branch');
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

  util.logSubTask('deploying');
  return initRepo()
    .then(checkoutBranch)
    .then(addAll)
    .then(commit)
    .then(push)
    .catch((error) => util.logError(error));
};
