#!/usr/bin/env node
'use strict';

const args = require('yargs').argv;

const tasks = require('../tasks').cli;
const util = require('./util');

const task = args._[0] || 'watch';

try {
  require(`${process.cwd()}/zunderfile`);
  util.log(util.colors.green('using zunderfile'));
} catch (err) {
  // ignore if it's just that no zunderfile is present
  if (err.code !== 'MODULE_NOT_FOUND') {
    util.logError('An unexpected error was thrown while loading your zunderfile:\n')
    util.log(err.stack || err)
    process.exit(1)
  }
}

if (tasks[task]) {
  util.logTask(`Running ${task} task`);
  tasks[task]();
} else {
  util.log()
  util.log(util.colors.red.bold(`zunder ${task}`), util.colors.red('is not a task'));
  util.log()
  util.log(util.colors.underline('Available tasks'));
  Object.keys(tasks).forEach((task) => {
    util.log(`• ${task}`);
  })
  process.exit(1);
}
