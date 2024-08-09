/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('test tasks actions', () => {
  let user;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('userPortaEmpleado').then(data => {
      user = data;
    });
  });

  it('should create a absence', () => {
    cy.enterOfficeAndLogin(office, user.userName, user.userPassword);
    cy.clickOnModuleElement('Documentos', 'Ausencias');
    cy.findByTestId('create-absences-button').click();
    cy.get('#create-absences-modal').should('exist');
    cy.get('[data-testid=input-subject-absences]').find('input').type('Ausencia para Cypress');
    cy.findByTestId('input-type-absences').click();
    cy.get('.el-select__popper[aria-hidden=false]').find('.el-select-dropdown__item').contains('ERTE').click();
    cy.get('#date-picker-end-date').click();
    cy.get('.el-picker__popper').find('table').find('td').last().click({ force: true });
    cy.get('.el-picker-panel__link-btn').last().click({ force: true });
    cy.get('.el-upload__input').selectFile('cypress/fixtures/Example2.pdf', { force: true });
    cy.get('.el-badge__content').should('exist');
    cy.writeInTiny('Ejemplo de consulta');
    cy.interceptCrmRequest({
      method: 'POST',
      path: 'absences',
      trigger: () => cy.findByTestId('submit-task-form-modal').click(),
      callback: (body, status) => {
        expect(status).equal(200);
      }
    });
  });

})