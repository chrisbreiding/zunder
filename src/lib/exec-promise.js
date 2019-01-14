'use strict'

const exec = require('child_process').exec

module.exports = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    return exec(command, options, (error, stdout, stderr) => {
      if (error) return reject(error)

      return resolve({ stdout, stderr })
    })
  })
}
