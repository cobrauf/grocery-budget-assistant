/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('mockBackendAPI', () => {
  cy.intercept('GET', '**/api/**', {
    statusCode: 200,
    body: { message: 'Welcome to the Grocery Budget Assistant API' }
  }).as('backendAPI');

  // Also intercept direct calls to the root path
  cy.intercept('GET', 'http://localhost:8000/', {
    statusCode: 200,
    body: { message: 'Welcome to the Grocery Budget Assistant API' }
  }).as('directBackendAPI');

  // Intercept calls using relative paths
  cy.intercept('GET', '/', {
    statusCode: 200,
    body: { message: 'Welcome to the Grocery Budget Assistant API' }
  }).as('relativeBackendAPI');
})

declare global {
  namespace Cypress {
    interface Chainable {
      mockBackendAPI(): Chainable<void>
    }
  }
}