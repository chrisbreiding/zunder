RSVP = require 'rsvp'

module.exports = (func)->
  (args...)->
    new RSVP.Promise (resolve, reject)->
      func args..., (err, args...)->
        return reject err if err

        resolve args...
