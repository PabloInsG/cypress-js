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
    cy.wait(2000);
    cy.get('#ep-main-table').then($table => {
      cy.get('.el-table__row').first().find('.el-checkbox__input').click()
      cy.wrap($table).findByTestId('selectedRowDelete').click();
      cy.get('.el-dialog').find('input').type('1');
      cy.get('.el-dialog').find('.el-button--primary').click();
    })
    cy.get('.el-message').should('exist');
  });

})