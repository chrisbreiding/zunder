'use strict';

const args = require('yargs').argv;
const server = require('./server');

server(args.devDir);
