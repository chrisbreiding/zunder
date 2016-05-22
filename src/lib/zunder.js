#!/usr/bin/env node
'use strict';

const args = require('yargs').argv;

const getConfig = require('./config');
const loadTasks = require('./tasks');
const util = require('./util');

const task = args._[0] || 'watch';

getConfig().then((config) => {
  const tasks = loadTasks(config);

  if (!tasks[task]) {
    util.log(util.colors.red.bold(`\nzunder ${task}`), util.colors.red('is not a task\n'));
    util.log(util.colors.underline('Available tasks'));
    util.log(`- ${Object.keys(tasks).join('\n- ')}`);
    return;
  }
  util.logTask(`Running ${task} task`);
  tasks[task]();
});
