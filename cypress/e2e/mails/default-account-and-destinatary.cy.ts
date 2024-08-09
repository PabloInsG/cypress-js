/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('TEST Email', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  it('Email box should have default account and a destinatary', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.get('.el-sub-menu').first().trigger('mouseenter', { force: true });
    cy.get('.el-popper[aria-hidden="false"]')
      .should('be.visible')
      .find('.el-menu-item')
      .first()
      .click();
    cy.get('body').click();
    cy.findAllByTestId('rowDetailLink', { timeout: 25000 }).first().click();
    cy.goToRelationView('Historial', 'mail');
    cy.findByRole('button', { name: 'Enviar email' }).click();
    cy.findByTestId('create-email-from').find('.el-select__selected-item').should('not.be.empty');
    cy.findByTestId('create-email-to').find('.el-select__selected-item').should('not.be.empty');
  });
});
