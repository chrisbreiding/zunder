#!/usr/bin/env node
'use strict';

const args = require('yargs').argv;

const tasks = require('./tasks').clit;
const util = require('./util');

const task = args._[0] || 'watch';

try {
  require(`${process.cwd()}/zunderfile`);
  util.log(util.colors.green('using zunderfile'));
} catch (e) {
  // no zunderfile set up
}

if (tasks[task]) {
  util.logTask(`Running ${task} task`);
  tasks[task]();
} else {
  util.log(util.colors.red.bold(`\nzunder ${task}`), util.colors.red('is not a task\n'));
  util.log(util.colors.underline('Available tasks'));
  util.log(`- ${Object.keys(tasks).join('\n- ')}`);
  process.exit(1);
}
