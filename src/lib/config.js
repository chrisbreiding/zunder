'use strict';

const Promise = require('RSVP').Promise;

module.exports = () => {
  return Promise.resolve({ srcFile: 'main.jsx' });
};
