#!/usr/bin/env node
'use strict';

const args = require('yargs').argv;

const loadTasks = require('./tasks');
const util = require('./util');

const task = args._[0] || 'watch';
const tasks = loadTasks();

if (tasks[task]) {
  util.logTask(`Running ${task} task`);
  tasks[task]();
} else {
  util.log(util.colors.red.bold(`\nzunder ${task}`), util.colors.red('is not a task\n'));
  util.log(util.colors.underline('Available tasks'));
  util.log(`- ${Object.keys(tasks).join('\n- ')}`);
}
