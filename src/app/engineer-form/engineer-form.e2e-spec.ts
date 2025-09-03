// Type definitions for Cypress and custom commands
/// <reference types="cypress" />

describe('Engineer Form E2E Tests', { testIsolation: false }, () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the form', () => {
    cy.get('form').should('be.visible');
    cy.get('[data-cy=firstName]').should('be.visible');
    cy.get('[data-cy=lastName]').should('be.visible');
    cy.get('[data-cy=email]').should('be.visible');
    cy.get('[data-cy=dateOfBirth]').should('be.visible');
    cy.get('[data-cy=framework]').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('[data-cy=submit]').click();
    
    // Check for validation errors
    cy.get('.error-message').should('contain', 'First name is required');
    cy.get('.error-message').should('contain', 'Last name is required');
    cy.get('.error-message').should('contain', 'Email is required');
    cy.get('.error-message').should('contain', 'Framework is required');
  });

  it('should validate email format', () => {
    cy.get('[data-cy=email]').type('invalid-email');
    cy.get('[data-cy=email]').blur();
    cy.get('.error-message').should('contain', 'Please enter a valid email');
    
    cy.get('[data-cy=email]').clear().type('valid@example.com');
    cy.get('.error-message').should('not.contain', 'Please enter a valid email');
  });

  it('should add and remove hobbies', () => {
    // Add a hobby
    cy.get('[data-cy=hobby]').type('Programming');
    cy.get('[data-cy=hobby-duration]').type('5 years');
    cy.get('[data-cy=add-hobby]').click();
    
    // Check if hobby was added
    cy.get('[data-cy=hobby-item]').should('have.length', 1);
    cy.get('[data-cy=hobby-item]').should('contain', 'Programming (5 years)');
    
    // Remove the hobby
    cy.get('[data-cy=remove-hobby]').first().click();
    cy.get('[data-cy=hobby-item]').should('have.length', 0);
  });

  it('should update framework versions when framework changes', () => {
    // Select a framework
    cy.get('[data-cy=framework]').click();
    cy.get('mat-option').contains('Angular').click();
    
    // Check if version select is enabled and has options
    cy.get('[data-cy=version]').should('be.enabled');
    cy.get('[data-cy=version]').click();
    cy.get('mat-option').should('have.length.gt', 0);
  });

  it('should submit the form with valid data', () => {
    // Fill in the form
    cy.get('[data-cy=firstName]').type('John');
    cy.get('[data-cy=lastName]').type('Doe');
    cy.get('[data-cy=email]').type('john.doe@example.com');
    
    // Set date of birth
    cy.get('[data-cy=dateOfBirth]').type('1990-01-01');
    
    // Select framework and version
    cy.get('[data-cy=framework]').click();
    cy.get('mat-option').contains('Angular').click();
    cy.get('[data-cy=version]').click();
    cy.get('mat-option').first().click();
    
    // Add a hobby
    cy.get('[data-cy=hobby]').type('Coding');
    cy.get('[data-cy=hobby-duration]').type('3 years');
    cy.get('[data-cy=add-hobby]').click();
    
    // Submit the form
    cy.get('[data-cy=submit]').click();
    
    // Check for success message or redirect
    cy.get('.success-message').should('be.visible');
  });
});
