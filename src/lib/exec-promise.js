'use strict';

const RSVP = require('rsvp');
const exec = require('child_process').exec;

module.exports = (command, options = {}) => {
  return new RSVP.Promise((resolve, reject) => {
    return exec(command, options, (error, stdout, stderr) => {
      if (error) return reject(error);
      return resolve({ stdout, stderr });
    });
  });
};
