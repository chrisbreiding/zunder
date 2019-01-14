const testObjectSpread = () => {
  cy.get('.object-spread').should('have.text', 'object spread')
}
const testNodeModuleExport = () => {
  cy.get('.node-module-export').should('have.text', 'node module export')
}
const testEnv = (env) => () => {
  cy.get('.env').should('have.text', `env var value ${env}`)
}
const testDecorators = () => {
  cy.get('.observable-value').should('have.text', 'original')
  cy.get('input').type('updated')
  cy.get('.observable-value').should('have.text', 'updated')
}
const testStyles = () => {
  cy.get('.object-spread')
  .should('have.css', 'width', '200px')
  .should('have.css', 'height', '40px')
}

describe('default configuration', () => {
  describe('build-dev', () => {
    before(() => {
      cy.task('zunder', { task: 'build-dev', project: 'default' })
    })

    beforeEach(() => {
      cy.visit('test/projects/default/dist/index.html')
    })

    it('handles object spread', testObjectSpread)
    it('node module export', testNodeModuleExport)
    it('handles decorators / observable values', testDecorators)
    it('handles env', testEnv('development'))
    it('handles scss', testStyles)
    it('copies static assets / does not cache-bust the assets', () => {
      cy.task('list:files', 'test/projects/default/dist/*').then((files) => {
        expect(files).to.eql([
          'app.css',
          'app.js',
          'example.json',
          'index.html',
        ])
      })
    })
    it('cleans before building', () => {
      const filePath = 'test/projects/default/dist/extra.txt'

      cy.writeFile(filePath, 'should be removed')
      cy.task('zunder', { task: 'build-dev', project: 'default', force: true })
      cy.readFile(filePath).should('not.exist')
    })
  })

  describe('build-prod', () => {
    before(() => {
      cy.task('zunder', { task: 'build-prod', project: 'default' })
    })

    beforeEach(() => {
      cy.visit('test/projects/default/dist-prod/index.html')
    })

    it('handles object spread', testObjectSpread)
    it('node module export', testNodeModuleExport)
    it('handles decorators / observable values', testDecorators)
    it('handles env', testEnv('production'))
    it('handles scss', testStyles)
    it('copies static assets / cache-busts appropriate assets', () => {
      cy.task('list:files', 'test/projects/default/dist-prod/*').then((files) => {
        expect(files).to.have.length(4)
        const cachbustedRegex = /^(app|example)\-[a-z0-9]{5,}\.(jso?n?|css)$/

        expect(files[0]).to.match(cachbustedRegex)
        expect(files[1]).to.match(cachbustedRegex)
        expect(files[2]).to.match(cachbustedRegex)
        expect(files[3]).to.equal('index.html')
      })
    })
    it('cleans before building', () => {
      const filePath = 'test/projects/default/dist-prod/extra.txt'

      cy.writeFile(filePath, 'should be removed')
      cy.task('zunder', { task: 'build-prod', project: 'default', force: true })
      cy.readFile(filePath).should('not.exist')
    })
  })

  describe('test', () => {
    it('runs tests', () => {
      cy.task('zunder:test').then((result) => {
        expect(result.code).to.equal(0)
        expect(result.stdout).to.include('this is a passing test')
      })
    })
  })
})
