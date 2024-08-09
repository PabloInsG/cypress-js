/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('test tasks actions', () => {
  const office = Cypress.env('despacho');
  let user

  before(() => {
    cy.fixture('userPortaEmpleado').then(data => {
      user = data;
    });
  });

  it('should add a document in a chat', () => {
    cy.enterOfficeAndLogin(office, user.userName, user.userPassword);
    cy.clickOnModuleElement('Notificaciones', 'Consultas');
    cy.wait(2000);
    cy.findAllByTestId('rowDetailLink').first().click();
    cy.goToDetailView('Historial');

    cy.get('input.el-upload__input').selectFile('cypress/fixtures/Example1.pdf', { force: true });
    cy.get('.el-upload-list').find('.el-upload-list__item').should('have.length', 1);
    cy.findByTestId('send-chat').click();
  });

});
