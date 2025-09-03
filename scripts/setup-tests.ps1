# Install Cypress and required dependencies
npm install --save-dev cypress @cypress/webpack-preprocessor @types/cypress

# Create necessary directories
mkdir -Force test/e2e | Out-Null
mkdir -Force cypress/support | Out-Null

# Create basic Cypress support files
@'
/// <reference types="cypress" />

// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
'@ | Out-File -FilePath "cypress/support/e2e.ts" -Encoding utf8

@'
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(selector: string, target: string): Chainable<void>
//       dismiss(selector: string): Chainable<JQuery<HTMLElement>>
//     }
//   }
// }
'@ | Out-File -FilePath "cypress/support/commands.ts" -Encoding utf8

Write-Host "Test setup complete!" -ForegroundColor Green
