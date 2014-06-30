proxyquire = require 'proxyquire'
mockFs = require 'mock-fs'

mocks =
  gulp:
    task: sinon.spy()
  fs:
    readFile: sinon.spy()
    writeFile: sinon.spy()
zunder = proxyquire '../src/tasks/zunder', mocks

describe 'zunder task', ->

  beforeEach ->
    mocks.gulp.task.reset()
    mocks.fs.readFile.reset()
    mocks.fs.writeFile.reset()
    zunder { prefix: '' }

  it 'sets up a task called zunder', ->
    expect(mocks.gulp.task).was.calledWith 'zunder'

  describe 'updating package.json', ->

    beforeEach ->
      mocks.gulp.task.firstCall.args[1]()

    describe 'when none of the zunder properties exist', ->

      beforeEach ->
        mocks.fs.readFile.firstCall.args[1] null, '{}'
        packageContents = mocks.fs.writeFile.firstCall.args[1]
        @packageData = JSON.parse packageContents

      it 'overwrites the package.json', ->
        expect(mocks.fs.writeFile).was.calledWith 'package.json'

      it 'adds a browser.ember property with a path to ember', ->
        expect(@packageData.browser.ember).to.equal './app/vendor/ember.js'

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
