proxyquire = require 'proxyquire'
fs = require 'fs'
path = require 'path'

mocks =
  fs:
    readFile: sinon.spy()
    writeFile: sinon.spy()
    exists: sinon.spy()
    createWriteStream: sinon.stub()
    stat: sinon.spy()
  mkdirp: sinon.spy()
  http:
    get: sinon.stub().returns on: ->
  ncp: sinon.spy()

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

    scaffoldFiles = [
      'index.hbs'
      'main.js'
      'main.styl'
      'routes.js'
      'app/app.js'
      'lib/base.styl'
      'lib/variables.styl'
    ]

    scaffoldFiles.forEach (file)->

      describe file, ->

        beforeEach ->
          readFileCallback = mocks.fs.readFile.withArgs("src/#{file}").lastCall.args[1]
          readFileCallback 'not found'

        it 'exists in src', (done)->
          fs.readFile "src/scaffold/#{file}", { encoding: 'utf-8' }, done

        it 'creates the file with boilerplate content', (done)->
          fs.readFile "src/scaffold/#{file}", { encoding: 'utf-8' }, (err, expected)->
            return done err if err

            mocks.fs.readFile.lastCall.args[2] null, expected
            actual = mocks.fs.writeFile.lastCall.args[1]
            expect(actual).to.equal expected
            done()

    scaffoldDirs = [
      'vendor/fontawesome'
      'vendor/fonts'
    ]

    scaffoldDirs.forEach (dir)->

      describe dir, ->

        beforeEach ->
          readFileCallback = mocks.fs.stat.withArgs("src/#{dir}").lastCall.args[1]
          readFileCallback 'not found'

        it 'exists in src', (done)->
          fs.stat "src/scaffold/#{dir}", done

        it 'copies the directory', ->
          expect(mocks.ncp).was.calledWith path.resolve("#{__dirname}/../src/scaffold/#{dir}"), "src/#{dir}"
