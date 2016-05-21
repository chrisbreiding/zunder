'use strict';

const bodyParser = require('body-parser');
const globSync = require('glob').sync;
const nodemon = require('gulp-nodemon');
const gutil = require('gulp-util');
const express = require('express');
const morgan = require('morgan');
const portfinder = require('portfinder');

const paths = require('./paths');

function setupMockServer (app) {
  let server;
  try {
    server = require(`${process.cwd()}/server`);
  } catch (error) {
    // no server set up
    return;
  }

  const mocks = globSync('./server/mocks/**/*.js').map((file) => {
    return require(`${process.cwd()}${file.replace(/^./, '')}`);
  });

  server(app, express);
  mocks.forEach((route) => route(app, express));
}

function runServer (dir, port) {
  const app = express();
  app.use(express.static(dir));
  app.use(morgan('dev'));
  app.use(bodyParser.json());

  setupMockServer(app);

  return app.listen(port, () => {
    const url = `http://localhost:${port}`;
    gutil.log(`listening on ${gutil.colors.yellow(url)}...`);
  });
}

module.exports = () => {
  return {
    watch () {
      return nodemon({
        script: `${__dirname}/run-dev-server.js`,
        watch: [`${process.cwd()}/server`],
        args: [`--devDir=${paths.devDir}`],
      });
    },

    run (dir, port) {
      if (port) {
        runServer(dir, port);
      } else {
        portfinder.getPort((err, port) => {
          runServer(dir, port);
        });
      }
    },
  };
};
