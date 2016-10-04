const del = require('del');

const config = require('../lib/config');
const { emit } = require('../lib/events')

const cleanDev = () => del(config.devDir)
const cleanProd = () => del(config.prodDir)
const cleanTests = () => del(config.testDir)

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
