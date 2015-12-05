args = require('yargs').argv
server = require './server'

server args.devDir, args.devPort
