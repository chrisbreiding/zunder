describe('config.addBrowserifyConfigTo', () => {
  it('adds browserify field to package.json', () => {
    cy.task('zunder', { task: 'build-dev', project: 'default', args: '--zunderfile add-browserify-config-zunderfile.js' })
    cy.readFile('test/projects/node_modules/chai/package.json')
    .then((contents) => {
      const browserify = contents.browserify

      expect(browserify).to.be.an('object')
      expect(browserify.transform).to.be.an('array')
      expect(browserify.transform).to.have.length(1)
      expect(browserify.transform[0]).to.be.an('array')
      expect(browserify.transform[0][0]).to.include('babelify')
      expect(browserify.transform[0][1]).to.be.an('object')
      expect(browserify.transform[0][1].presets).to.be.an('array')
      expect(browserify.transform[0][1].presets[0]).to.include('preset-env')
    })
  })
})
