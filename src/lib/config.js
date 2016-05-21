'use strict';

const Promise = require('RSVP').Promise;

module.exports = {
  getConfig () {
    return Promise.resolve({ srcFile: 'main.jsx' });
  },
};
