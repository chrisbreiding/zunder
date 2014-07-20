module.exports = (config = {})->
  config.prefix     ||= ''
  config.srcDir     ||= 'src'
  config.staticDir  ||= 'static'
  config.devDir     ||= '_dev'
  config.prodDir    ||= '_prod'

  tasks = require('fs').readdirSync "#{__dirname}/tasks/"

  require("#{__dirname}/tasks/#{task}")(config) for task in tasks
  return
