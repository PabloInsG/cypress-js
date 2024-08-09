/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Test Combine', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const client1 = {
    nombre: 'Alan Luna Cypress combinar registro',
    email: 'alan@gmail.com',
    telefono1: '646411694',
  };
  const client2 = {
    nombre: 'Alan Luna Principal combinar registro',
    email: 'alan@gmail.com',
    telefono1: '646411694',
  };
  let element: string;
  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  it('should combine 2 registries', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.wait(2000);
    cy.get('.el-sub-menu').first().trigger('mouseenter', { force: true });
    cy.get('.el-popper[aria-hidden="false"]')
      .should('be.visible')
      .find('.el-menu-item')
      .first()
      .click();
    cy.get('body').click();
    cy.quickCreateRegister(client1);
    cy.findByTestId('button_go_back').should('not.have.class', 'is-disabled').click();
    cy.quickCreateRegister(client2);
    cy.findByTestId('detailViewActionsButton').should('not.have.class', 'is-disabled').click();
    cy.findByTestId('combine-button').click();
    cy.findByTestId('childContact-select').type(client1.nombre);
    cy.get('.el-select__popper[aria-hidden="false"]')
      .find('.el-select-dropdown__item')
      .contains(client1.nombre)
      .click();
    cy.get('.el-dialog__footer').find('.el-button.el-button--primary').click();
    cy.findByTestId('button_go_back').should('not.have.class', 'is-disabled').click();
    cy.findByTestId('globalQuickSearch').clear().type(client1.nombre);
    cy.findByTestId('quickSearchButton').click();
    cy.findByTestId('rowDetailLink').should('not.exist');
    cy.findByTestId('globalQuickSearch').clear().type(client2.nombre);
    cy.findByTestId('quickSearchButton').click();
    cy.get('body').click({ force: true });
    cy.get('.el-table__body').find('.el-checkbox').eq(1).click({ force: true });
    cy.get('button').contains('Borrar').click({ force: true });
    cy.get('input[placeholder=1]').type('1');
    cy.get('.el-dialog').find('button').eq(1).click();
    cy.get('.el-message__content');
  });
});
