/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  it('should validate the article to be deleted', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnModuleElement('Gestión', 'Expedientes judiciales');
    cy.findByTestId('rowDetailLink').first().click();
    cy.goToRelationView('Cuentas', 'articulos_met');
    cy.contains('Lista de artículos');
    cy.get('button').contains('Añadir artículo').click();
    cy.get('.el-dialog ').as('modal');
    cy.get('@modal').find('.el-input').first().clear().type('Artículo para borrar');
    cy.get('@modal')
      .find('.el-form-item__content')
      .contains('Familia')
      .next()
      .find('.el-input__wrapper')
      .click();
    cy.get('.el-popper[aria-hidden="false"]')
      .find('.el-select-dropdown__item')
      .contains('Gasto')
      .click({ force: true });
    cy.get('@modal').find('button').contains('Crear').as('button');
    cy.interceptCrmRequest({
      path: 'articles',
      trigger: () => cy.get('@button').click(),
      callback: (body, status) => {
        expect(status).eq(200);
        cy.get('.el-table__row').first().find('td').last().find('button').first().click();
        cy.get('.el-dialog').then($box => {
          cy.wrap($box)
            .find('.el-dialog__header')
            .contains(/escriba el número de elementos a eliminar/i);
          cy.wrap($box)
            .find('label')
            .contains(/estás a punto de eliminar 1 elementos/i);
          cy.wrap($box).find('.el-input__inner').invoke('attr', 'placeholder').should('eq', '1');
          cy.wrap($box).find('.el-input__inner').type('1');
          cy.wrap($box).find('.el-button--primary').click();
          cy.wrap($box).should('not.be.visible');
        });
        cy.get('.el-message.el-message--success')
          .should('be.visible')
          .and('exist')
          .then($messageSucces => {
            cy.wrap($messageSucces).should('not.be.visible');
          });
      },
    });
  });
});
