module.exports = (gulp, config = {})->
  config.srcFile ||= 'main.jsx'

  tasks = require('fs').readdirSync "#{__dirname}/tasks/"

  require("#{__dirname}/tasks/#{task}")(gulp, config) for task in tasks
  return
