import { getRandomString } from '../support/helpers'

describe('Time Tracking App', () => {
  const timerButtons = [
    { label: 'Start', alias: 'startButton' },
    { label: 'Stop', alias: 'stopButton' },
    { label: 'Reset', alias: 'resetButton' },
  ]

  beforeEach(() => {
    cy.intercept('GET', '/api/sessions').as('sessionsGet')

    cy.visit('/')

    cy.contains('.btn', /^View Saved Sessions$/).as('viewSavedSessionsButton')

    cy.contains('.form-group', /^New Session$/)
      .find('input[name="name"]')
      .as('newSessionNameInput')

    for (const { label, alias } of timerButtons) {
      cy.contains('.btn', new RegExp(`^${label}$`)).as(alias)
    }

    cy.contains('.btn', /^Save$/).as('saveButton')
  })

  // TCQ-1
  it('should allow to save a new session without errors', () => {
    // given
    const sessionName = 'test'

    cy.intercept('GET', '/sockjs-node/info*').as('sockjsGet')
    cy.intercept('POST', '/api/sessionss').as('sessionsPost')

    cy.get('@newSessionNameInput').type(sessionName)

    cy.get('@startButton').click()

    cy.wait('@sockjsGet')

    cy.clock(new Date())

    cy.tick(2000)

    cy.get('@stopButton').click()

    // when
    cy.get('@saveButton').click()

    // then
    cy.wait('@sessionsPost').should((xhr) => {
      expect(xhr.request.body.name).to.equal(sessionName)
      expect(xhr.response.statusCode).to.equal(200)
    })
  })

  // TCQ-2, TCQ-8
  it('should disable "Start" and "Reset" buttons when timer is running', () => {
    // when
    cy.get('@startButton').click()

    // then
    cy.get('@startButton').should('be.disabled')
    cy.get('@stopButton').should('not.be.disabled')
    cy.get('@resetButton').should('be.disabled')
  })

  // TCQ-3
  it('should not allow to save session when session name is too long', () => {
    // given
    const stringLength = 301 // let's assume that we agreed 300 as maximum length
    const tooLongName = getRandomString(stringLength)

    cy.intercept('GET', '/sockjs-node/info*').as('sockjsGet')
    cy.intercept('POST', '/api/session').as('sessionsPost')

    cy.get('@startButton').click()

    cy.wait('@sockjsGet')

    cy.clock(new Date())

    cy.tick(2000)

    cy.get('@stopButton').click()

    // when
    // use custom .fill() command instead of .type() as typing long strings in Cypress can take a lot of time
    cy.get('@newSessionNameInput').fill(tooLongName)

    // then
    cy.get('@saveButton').should('be.disabled')

    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('have.text', 'Please provide a name no longer than 300 characters.')
  })

  // TCQ-4
  it('should not log error when navigating to Saved Sessions when timer is running', () => {
    // given
    cy.window().then((win) => {
      cy.wrap(cy.spy(win.console, 'error')).as('spyWinConsoleError')
    })

    cy.get('@startButton').click()

    // when
    cy.get('@viewSavedSessionsButton').click()

    // then
    cy.get('@spyWinConsoleError').should('not.be.called')
  })

  // TCQ-5
  it('should not allow to save session when session name consists only of whitespace characters', () => {
    // given
    const incorrectName = ' '

    cy.intercept('GET', '/sockjs-node/info*').as('sockjsGet')
    cy.intercept('POST', '/api/sessions').as('sessionsPost')

    cy.get('@startButton').click()

    cy.wait('@sockjsGet')

    cy.clock(new Date())

    cy.tick(2000)

    cy.get('@stopButton').click()

    // when
    cy.get('@newSessionNameInput').type(incorrectName)

    // then
    cy.get('@saveButton').should('be.disabled')

    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('have.text', 'Please provide a valid session name.')
  })

  // TCQ-6
  it('should sent session start time as createdAt body parameter', () => {
    // given
    cy.intercept('GET', '/sockjs-node/info*').as('sockjsGet')
    cy.intercept('POST', '/api/sessions').as('sessionsPost')

    cy.get('@newSessionNameInput').type('test')

    cy.get('@startButton').click()

    const expectedSessionStartTime = new Date()

    cy.wait('@sockjsGet')

    cy.clock(expectedSessionStartTime)

    cy.tick(10000)

    cy.get('@stopButton').click()

    // when
    cy.get('@saveButton').click()

    // then
    cy.wait('@sessionsPost').should((xhr) => {
      expect(xhr.request.body.createdAt).to.equal(
        expectedSessionStartTime.toString()
      )
      expect(xhr.response.statusCode).to.equal(200)
    })
  })

  // TCQ-7
  it('should not fetch sessions when homepage is opened', () => {
    // when
    // we need to use static wait here to be sure that request did not occur after some time.
    // Otherwise the test randomly passes.
    cy.wait(500)

    // then
    cy.get('@sessionsGet.all').then((interceptions) => {
      expect(interceptions).to.have.length(0)
    })
  })

  // TCQ-8
  it('should disable "Stop" and "Reset" buttons when timer is not running and its value is 0', () => {
    // then
    cy.get('@startButton').should('not.be.disabled')
    cy.get('@stopButton').should('be.disabled')
    cy.get('@resetButton').should('be.disabled')
  })
})
