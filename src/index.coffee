module.exports = (gulp, config = {})->
  config.prefix        ||= ''
  config.srcDir        ||= 'src'
  config.staticDir     ||= 'static'
  config.devDir        ||= 'dist'
  config.prodDir       ||= 'dist-prod'
  config.webpackConfig ||= require './scaffod/webpack.config'

  tasks = require('fs').readdirSync "#{__dirname}/tasks/"

  require("#{__dirname}/tasks/#{task}")(gulp, config) for task in tasks
  return
