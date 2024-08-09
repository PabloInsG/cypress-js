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

  it('should create a holiday', () => {
    cy.enterOfficeAndLogin(office, user.userName, user.userPassword);
    cy.clickOnModuleElement('Documentos', 'Vacaciones');
    cy.findByTestId('create-holidays-button').click();
    cy.get('#create-holidays-modal').should('exist');
    cy.get('[data-testid=input-subject-holiday]').find('input').type('VACACIONES para Cypress');
    cy.get('#date-picker-end-date').click();
    cy.get('.el-picker__popper').find('table').find('td').last().click({ force: true });
    cy.get('.el-picker-panel__link-btn').last().click({ force: true });
    cy.get('.el-upload__input').selectFile('cypress/fixtures/Example2.pdf', { force: true });
    cy.get('.el-badge__content').should('exist');
    cy.writeInTiny('Ejemplo de consulta');
    cy.interceptCrmRequest({
      method: 'POST',
      path: 'holidays',
      trigger: () => cy.findByTestId('submit-holidays-form-modal').click(),
      callback: (body, status) => {
        expect(status).equal(200);
      }
    });
  });

})