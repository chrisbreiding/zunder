'use strict';

const paths = require('./paths')
const server = require('./server');

server().run(paths.devDir);
