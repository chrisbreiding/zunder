'use strict';

const bodyParser = require('body-parser');
const globSync = require('glob').sync;
const gutil = require('gulp-util');
const express = require('express');
const morgan = require('morgan');
const portfinder = require('portfinder');

function runServer (dir, port) {
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

  const app = express();
  app.use(express.static(dir));
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  server(app, express);
  mocks.forEach((route) => route(app, express));

  return app.listen(port, function() {
    const url = `http://localhost:${port}`;
    gutil.log(`listening on ${gutil.colors.yellow(url)}...`);
  });
}

module.exports = (dir, port) => {
  if (port) {
    runServer(dir, port);
  } else {
    portfinder.getPort((err, port) => {
      runServer(dir, port);
    });
  }
};
