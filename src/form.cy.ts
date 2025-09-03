/// <reference types="cypress" />

describe('Frontend Engineer Form - E2E', () => {
  it('открывается и позволяет добавить хобби', () => {
    cy.visit('/');

    // Верхний заголовок с тайпингом (к моменту проверки текст уже должен полностью появиться)
    cy.contains('Frontend Engineer Form', { timeout: 10000 }).should('be.visible');

    // Добавление хобби без заполнения всей формы
    cy.get('[data-cy="hobby"]').type('Reading');
    cy.get('input[type="number"]').type('12');
    cy.contains('button', 'Add Hobby').click();

    // Проверяем, что чип с хобби появился
    cy.contains('mat-chip', 'Reading (12 months)').should('exist');
  });
});
