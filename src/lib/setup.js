'use strict'

const fs = require('fs')

const _ = require('lodash')
const globSync = require('glob').sync

const exec = require('./exec-promise')
const promisify = require('./promisify')
const util = require('./util')

const mkdirp = promisify(require('mkdirp'))
const readFile = promisify(fs.readFile)

const devDeps = ['eslint', 'eslint-plugin-react', 'babel-eslint']
const deps = ['react', 'react-dom']

const run = () => {
  const scaffoldDir = __dirname.replace('lib', 'scaffold')

  const scaffolds = _(globSync(`${scaffoldDir}/**/*`, { dot: true }))
  .map((filePath) => filePath.replace(`${scaffoldDir}/`, ''))
  .reject((filePath) => filePath.indexOf('.DS_Store') > -1)
  .value()

  const files = _.filter(scaffolds, (filePath) => {
    return /\/?[-_A-Za-z]*\.\w+$/.test(filePath)
  })

  const directories = _.reject(scaffolds, (filePath) => {
    return _.includes(files, filePath)
  })

  return Promise.resolve()
  .then(() => {
    util.logSubTask('Installing dev dependencies')
    devDeps.forEach((dep) => util.logAction(dep))
    exec(`npm install --save-dev ${devDeps.join(' ')} --progress=false`)
  })
  .then(() => {
    util.logSubTask('Installing dependencies')
    deps.forEach((dep) => util.logAction(dep))
    return exec(`npm install --save ${deps.join(' ')} --progress=false`)
  })
  .then(() => {
    util.logSubTask('Scaffolding files')
    return Promise.all(directories.map((directory) => mkdirp(directory)))
  })
  .then(() => {
    return Promise.all(files.map((file) => {
      return readFile(file).catch(() => {
        // erroring indicates the file doesn't exist
        // which is the only case where the scaffold should go in place
        util.logAction(file)
        return fs.createReadStream(`${__dirname}/../scaffold/${file}`)
        .pipe(fs.createWriteStream(file))
      })
    }))
  })
  .catch((err) => { throw err })
}

module.exports = () => {
  return {
    run,
  }
}
