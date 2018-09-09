'use strict'

const argv = require('yargs').argv
const server = require('./server')

server().run(argv.devDir)
