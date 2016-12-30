const applyEnv = (env) => (cb) => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = env;
  }
  cb();
}

const applyDevEnv = applyEnv('development')
const applyProdEnv = applyEnv('production')
const applyTestEnv = applyEnv('test')

module.exports = () => {
  return {
    applyDevEnv,
    applyProdEnv,
    applyTestEnv,
  }
}
