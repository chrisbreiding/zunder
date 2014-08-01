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

  describe 'any case / no flavor specified', ->

    beforeEach ->
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

  describe 'when an ember app', ->

    beforeEach ->
      zunder @gulp, prefix: '', srcDir: 'src', flavor: 'ember'
      @gulp.task.firstCall.args[1]()

    describe 'updating package.json', ->

      describe 'when none of the zunder properties exist', ->

        beforeEach ->
          mocks.fs.readFile.firstCall.args[1] null, '{}'
          packageContents = mocks.fs.writeFile.firstCall.args[1]
          @packageData = JSON.parse packageContents

        it 'overwrites the package.json', ->
          expect(mocks.fs.writeFile).was.calledWith 'package.json'

        it 'adds a browser.ember property with a path to ember', ->
          expect(@packageData.browser.ember).to.equal './src/vendor/ember.js'

        it 'adds ember dependencies to browserify-shim property', ->
          expect(@packageData['browserify-shim'].ember.depends).to.eql ['jquery:jQuery', 'handlebars:Handlebars']

      describe 'when some zunder properties and other non-zunder properties exist', ->

        beforeEach ->
          oldData =
            browser:
              ember: './ember'
              foo: './foo'
            'browserify-shim':
              ember:
                depends: ['jquery:jQuery', 'bar:Bar']

          mocks.fs.readFile.firstCall.args[1] null, JSON.stringify(oldData)
          packageContents = mocks.fs.writeFile.firstCall.args[1]
          @packageData = JSON.parse packageContents

        it 'overwrites the package.json', ->
          expect(mocks.fs.writeFile).was.calledWith 'package.json'

        it 'leaves the browser properties alone', ->
          expect(@packageData.browser.ember).to.equal './ember'
          expect(@packageData.browser.foo).to.equal './foo'

        it 'appends the missing ember dependency to browserify-shim property, and leaves others alone', ->
          expect(@packageData['browserify-shim'].ember.depends).to.eql ['jquery:jQuery', 'bar:Bar', 'handlebars:Handlebars']

    describe 'scaffolding', ->

      beforeEach ->
        mocks.mkdirp.lastCall.args[1]()

        mocks.fs.exists.lastCall.args[1] false
        mocks.fs.createWriteStream.returns 'write stream'
        @res = pipe: sinon.spy()
        mocks.http.get.lastCall.args[1] @res

      it 'ensures vendor directory', ->
        expect(mocks.mkdirp).was.calledWith 'src/vendor'

      it 'downloads latest release of ember', ->
        expect(mocks.http.get).was.calledWith 'http://builds.emberjs.com/release/ember.js'

      it 'streams the contents to file', ->
        expect(mocks.fs.createWriteStream).was.calledWith 'src/vendor/ember.js'
        expect(@res.pipe).was.calledWith 'write stream'
