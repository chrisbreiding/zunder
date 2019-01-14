describe('source maps', () => {
  describe('build-dev', () => {
    before(() => {
      cy.task('zunder', { task: 'build-dev', project: 'default', args: '--zunderfile sourcemaps-zunderfile.js' })
    })

    it('adds source map file for each output file', () => {
      cy.readFile('test/projects/default/dist/main.js.map')
      cy.readFile('test/projects/default/dist/secondary.js.map')
    })

    it('adds source mapping to each output file', () => {
      cy.readFile('test/projects/default/dist/main.js').then((contents) => {
        expect(contents).to.include('main.js.map')
      })
      cy.readFile('test/projects/default/dist/secondary.js').then((contents) => {
        expect(contents).to.include('secondary.js.map')
      })
    })
  })

  describe('build-prod', () => {
    before(() => {
      cy.task('zunder', { task: 'build-prod', project: 'default', args: '--zunderfile sourcemaps-zunderfile.js' })
    })

    it('adds source map file for each output file', () => {
      cy.task('list:files', 'test/projects/default/dist-prod/*').then((files) => {
        const mapFiles = files
        .filter((file) => /\.js\.map$/.test(file))
        .map((file) => file.replace(/\-.*\.js\.map/, '.js.map'))

        expect(mapFiles).to.eql(['main.js.map', 'secondary.js.map'])
      })
    })

    it('adds source mapping to each output file', () => {
      cy.task('list:files', 'test/projects/default/dist-prod/*').then((files) => {
        const jsFiles = files.filter((file) => /\.js$/.test(file))
        const mapFiles = files.filter((file) => /\.js\.map$/.test(file))

        cy.wrap(mapFiles).each((file, i) => {
          cy.readFile(`test/projects/default/dist-prod/${jsFiles[i]}`).then((contents) => {
            expect(contents).to.include(file)
          })
        })
      })
    })
  })
})
