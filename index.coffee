module.exports = (config = {})->
  config.prefix ||= ''

  tasks = require('fs').readdirSync './tasks/'

  require("./tasks/#{task}")(config) for task in tasks
