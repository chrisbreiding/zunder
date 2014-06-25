gutil = require 'gulp-util'
fs = require 'fs'
RSVP = require 'rsvp'
exec = require './exec-promise'
_ = require 'lodash'

module.exports = (dir)->

  execInBuild = (command)->
    exec command, cwd: dir

  log = (message)->
    prefix = '. '
    gutil.log gutil.colors.green "#{prefix}#{message}"

  initRepo = ->
    if fs.existsSync "#{dir}/.git"
      return RSVP.resolve()

    exec('git config --get remote.origin.url').then (result)->
      url = result.stdout.replace(gutil.linefeed, '')
      execInBuild('git init').then ->
        log 'create repo'
        execInBuild "git remote add origin #{url}"

  checkoutBranch = ->
    log 'checkout gh-pages branch'
    execInBuild('git branch').then (result)->
      branchExists = _.any result.stdout.split('\n'), (branch)->
        /gh\-pages/.test branch
      flag = if branchExists then '' else '-b'
      execInBuild "git checkout #{flag} gh-pages"

  addAll = ->
    log 'add all files'
    execInBuild 'git add -A'

  commit = ->
    log 'commit'
    commitMessage = "automated commit by deployment at #{(new Date()).toUTCString()}"
    execInBuild("git commit --allow-empty -am '#{commitMessage}'").then ->

  push = ->
    log 'push to gh-pages branch'
    execInBuild 'git push -f origin gh-pages'

  initRepo()
    .then(checkoutBranch)
    .then(addAll)
    .then(commit)
    .then(push)
