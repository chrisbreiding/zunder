#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

require('./tasks');
const args = require('yargs').argv;
const chalk = require('chalk');
const loadTasks = require('./tasks');

const task = args._[0] || 'watch';

loadTasks().then((tasks) => {
  if (!tasks[task]) {
    console.log(chalk.red.bold(`'zunder ${task}' is not a task\n`));
    console.log(`Available tasks are:\n- ${Object.keys(tasks).join('\n- ')}`);
    return;
  }
  console.log(chalk.cyan(`Running ${task} task`));
  tasks[task]();
});
