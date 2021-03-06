'use strict'

const bodyParser = require('body-parser')
const express = require('express')
const globSync = require('glob').sync
const nodemon = require('gulp-nodemon')
const _ = require('lodash')
const morgan = require('morgan')
const path = require('path')
const portfinder = require('portfinder')
const argv = require('yargs').argv

const config = require('./config')
const util = require('./util')

function setupMockServer (app) {
  let server

  try {
    server = require(`${process.cwd()}/server`)
  } catch (error) {
    // no server set up
    return
  }

  const mocks = globSync('./server/mocks/**/*.js').map((file) => {
    return require(`${process.cwd()}${file.replace(/^./, '')}`)
  })

  server(app, express)
  mocks.forEach((route) => route(app, express))
}

function runServer (dir, port) {
  const app = express()

  app.use(morgan('dev'))
  app.use(bodyParser.json())
  app.use((req, res, next) => {
    // ensure no caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    })
    next()
  })
  app.use(express.static(dir))
  app.use((req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'))
  })

  setupMockServer(app)

  return app.listen(port, () => {
    const url = `http://localhost:${port}`

    util.logAction(`Listening on ${util.colors.yellow(url)}...`)
  })
}

const watch = () => {
  // gather command line args to pass them into nodemon
  const args = _(argv)
  .omit('_', '$0')
  .map((val, key) => `--${key}=${val}`)
  .concat([`--devDir=${config.devDir}`])
  .value()

  return nodemon({
    script: `${__dirname}/run-dev-server.js`,
    watch: [`${process.cwd()}/server`],
    args,
  })
}

const run = (dir) => {
  if (argv.port) {
    runServer(dir, argv.port)
  } else {
    portfinder.getPort((err, port) => {
      runServer(dir, port)
    })
  }
}

module.exports = () => {
  return {
    watch,
    run,
  }
}
