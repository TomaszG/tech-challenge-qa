export const getRandomString = (length) =>
  Cypress._.times(length, () => Cypress._.random(35).toString(36)).join('')
