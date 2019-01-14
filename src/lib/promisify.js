/* eslint-disable prefer-rest-params */

'use strict'

const slice = [].slice

module.exports = (func) => {
  return function (/* args... */) {
    const args = slice.call(arguments)

    return new Promise((resolve, reject) => {
      return func(...args.concat([function (error /*, args... */) {
        if (error) return reject(error)

        return resolve(...slice.call(arguments, 1))
      }]))
    })
  }
}
