RSVP = require 'rsvp'
exec = require('child_process').exec

module.exports = (command, options = {})->

  new RSVP.Promise (resolve, reject)->

    exec command, options, (error, stdout, stderr)->
      return reject error if error

      resolve stdout: stdout, stderr: stderr
