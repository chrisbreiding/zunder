'use strict'

const _ = require('lodash')
const fs = require('fs')

const exec = require('./exec-promise')
const config = require('./config')
const util = require('./util')

const logColor = 'gray'

module.exports = () => {
  const dir = config.prodDir
  const branch = config.deployBranch

  function execInBuild (command) {
    return exec(command, { cwd: dir })
  }

  function initRepo () {
    if (fs.existsSync(`${dir}/.git`)) return Promise.resolve()

    return exec('git config --get remote.origin.url').then((result) => {
      const url = result.stdout.replace(util.linefeed, '')

      return execInBuild('git init').then(() => {
        util.logAction('create repo')

        return execInBuild(`git remote add origin ${url}`)
      })
    })
  }

  function checkoutBranch () {
    return execInBuild('git branch').then((result) => {
      const branchExists = _.some(result.stdout.split('\n'), (existingBranch) => {
        return new RegExp(branch).test(existingBranch)
      })
      const flag = branchExists ? '' : '-b'

      util.logAction(`checkout ${branch} branch`)

      return execInBuild(`git checkout ${flag} ${branch}`)
    })
  }

  function addAll () {
    util.logAction('add all files')

    return execInBuild('git add -A')
  }

  function commit () {
    util.logAction('commit')
    const commitMessage = `automated commit by deployment at ${new Date().toUTCString()}`

    return execInBuild(`git commit --allow-empty -am '${commitMessage}'`)
  }

  function push () {
    util.logAction(`push to ${branch} branch`)

    return execInBuild(`git push -f origin ${branch}`)
  }

  util.logActionStart(logColor, 'Deploying')

  return initRepo()
  .then(checkoutBranch)
  .then(addAll)
  .then(commit)
  .then(push)
  .then(() => {
    util.logActionEnd(logColor, 'Successfully deployed')
  })
  .catch((error) => util.logError(error))
}
