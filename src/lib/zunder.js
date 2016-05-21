#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

const chalk = require('chalk');
const args = require('yargs').argv;

const getConfig = require('./config');
const loadTasks = require('./tasks');

const task = args._[0] || 'watch';

getConfig().then((config) => {
  const tasks = loadTasks(config);

  if (!tasks[task]) {
    console.log(chalk.red.bold(`'zunder ${task}' is not a task\n`));
    console.log(`Available tasks are:\n- ${Object.keys(tasks).join('\n- ')}`);
    return;
  }
  console.log(chalk.cyan(`Running ${task} task`));
  tasks[task]();
});
