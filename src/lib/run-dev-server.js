'use strict';

const args = require('yargs').argv;
const server = require('./server');

server().run(args.devDir);
