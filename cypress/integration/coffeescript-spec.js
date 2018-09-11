const testCoffeeScriptValue = () => {
  cy.get('.from-coffee').should('have.text', 'from coffeescript')
}

describe('coffeescript', () => {
  describe('build-dev', () => {
    before(() => {
      cy.task('zunder', { task: 'build-dev', project: 'coffeescript' })
    })

    beforeEach(() => {
      cy.visit('test/projects/coffeescript/dist/index.html')
    })

    it('handles coffeescript', testCoffeeScriptValue)
  })

  describe('build-prod', () => {
    before(() => {
      cy.task('zunder', { task: 'build-prod', project: 'coffeescript' })
    })

    beforeEach(() => {
      cy.visit('test/projects/coffeescript/dist-prod/index.html')
    })

    it('handles coffeescript', testCoffeeScriptValue)
  })
})
