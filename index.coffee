module.exports = (config = {})->
  config.prefix  ||= ''
  config.devDir  ||= '_dev'
  config.prodDir ||= '_prod'

  tasks = require('fs').readdirSync './tasks/'

  require("./tasks/#{task}")(config) for task in tasks
