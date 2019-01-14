module.exports = function (app, express) {
  let router = express.Router()

  app.use('/api/static', express.static(`${__dirname}/static`))
  app.use('/api', router)
}
