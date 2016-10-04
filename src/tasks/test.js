const { emit } = require('../lib/events')
const tests = require('../lib/tests')

const env = require('./env')
const clean = require('./clean')

const buildTestScripts = tests().build
const runTests = tests().run

module.exports = (taker) => {
  const { applyTestEnv } = env(taker)
  const { cleanTests } = clean(taker)

  const test = taker.series(
    emit('before:test'),
    applyTestEnv, cleanTests, buildTestScripts, runTests,
    emit('after:test')
  )

  return {
    buildTestScripts,
    runTests,

    test,
  }
}
