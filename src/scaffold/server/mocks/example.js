module.exports = function (app, express) {
  let router = express.Router()

  router.get('/', function (req, res) {
    res.send({ greeting: 'Hi', name: 'There' })
  })

  app.use('/api/data', router)
}
