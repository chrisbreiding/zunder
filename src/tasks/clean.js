const del = require('del');

const config = require('../lib/config');
const { emit } = require('../lib/events')
const util = require('../lib/util')

const cleanDev = () => {
  util.logSubTask('cleaning dev directory')
  return del(config.devDir)
}

const cleanProd = () => {
  util.logSubTask('cleaning prod directory')
  return del(config.prodDir)
}

const cleanTests = () => {
  util.logSubTask('cleaning test directory')
  return del(config.testDir)
}

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
