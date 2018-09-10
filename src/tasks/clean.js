const del = require('del')

const config = require('../lib/config')
const { emit } = require('../lib/events')
const util = require('../lib/util')

const logColor = 'yellow'

const clean = (dir, env) => {
  util.logActionStart(logColor, `Cleaning ${env} directory`)
  return del(dir).then(() => {
    util.logActionEnd(logColor, `Finished cleaning ${env} directory`)
  })
}

const cleanDev = () => clean(config.devDir, 'dev')

const cleanProd = () => clean(config.prodDir, 'prod')

const cleanTests = () => clean(config.testDir, 'test')

module.exports = (taker) => {
  return {
    cleanDev,
    cleanProd,
    cleanTests,

    clean: taker.parallel(
      emit('before:clean'),
      cleanDev, cleanProd, cleanTests,
      emit('after:clean')
    ),
  }
}
