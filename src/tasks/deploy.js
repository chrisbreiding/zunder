const deploy = require('../lib/deploy')
const { emit } = require('../lib/events')

const env = require('./env')
const clean = require('./clean')
const prod = require('./prod')

module.exports = (taker) => {
  const { applyProdEnv } = env(taker)
  const { cleanProd } = clean(taker)
  const { buildProd } = prod(taker)

  const buildAndDeploy = taker.series(
    emit('before:deploy'),
    applyProdEnv, cleanProd, buildProd, deploy,
    emit('after:deploy'),
  )

  return {
    buildAndDeploy,
  }
}
