proxyquire = require 'proxyquire'
fs = require 'fs'

mocks =
  fs:
    readFile: sinon.spy()
    writeFile: sinon.spy()
    exists: sinon.spy()
    createWriteStream: sinon.stub()
  mkdirp: sinon.spy()
  http:
    get: sinon.stub().returns on: ->

zunder = proxyquire '../src/tasks/zunder', mocks

describe 'zunder task', ->

  beforeEach ->
    @gulp = task: sinon.spy()

    mocks.fs.readFile.reset()
    mocks.fs.writeFile.reset()
    mocks.fs.exists.reset()
    mocks.fs.createWriteStream.reset()
    mocks.mkdirp.reset()
    mocks.http.get.reset()

    zunder @gulp, prefix: '', srcDir: 'src'
    @gulp.task.firstCall.args[1]()

  it 'sets up a task called zunder', ->
    expect(@gulp.task).was.calledWith 'zunder'

  describe 'scaffolding', ->

    beforeEach ->
      mocks.mkdirp.firstCall.args[1]()

    it 'ensures src directory', ->
      expect(mocks.mkdirp).was.calledWith 'src'

    scaffolds = [
      'main.coffee'
      'main.styl'
      'index.hbs'
    ]

    scaffolds.forEach (file)->

      describe file, ->

        beforeEach ->
          appCoffeeCallback = mocks.fs.readFile.withArgs("src/#{file}").lastCall.args[1]
          appCoffeeCallback 'not found'

        it 'creates the file with boilerplate content', (done)->
          fs.readFile "src/scaffold/#{file}", { encoding: 'utf-8' }, (err, expected)->
            return done err if err

            mocks.fs.readFile.lastCall.args[2] null, expected
            actual = mocks.fs.writeFile.lastCall.args[1]
            expect(actual).to.equal expected
            done()
