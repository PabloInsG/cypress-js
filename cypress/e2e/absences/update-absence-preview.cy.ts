/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('test tasks actions', () => {
  let user;
  const office = Cypress.env('despacho');
  const update = {
    subject: 'Mofidicado por Cypress',
    note: 'Estoy actualizando esta ausencia con Cypress',
  }

  before(() => {
    cy.fixture('userPortaEmpleado').then(data => {
      user = data;
    });
  });

  it('should update a absence', () => {
    cy.enterOfficeAndLogin(office, user.userName, user.userPassword);
    cy.clickOnModuleElement('Documentos', 'Ausencias');
    cy.wait(2000);
    cy.findAllByTestId('preview-drawer-button').first().click();
    cy.get('[data-testid=input-subject]').find('input').clear().type(update.subject);
    cy.writeInTiny(update.note)
    cy.findByTestId('submit-form-drawer').click();
  });

})