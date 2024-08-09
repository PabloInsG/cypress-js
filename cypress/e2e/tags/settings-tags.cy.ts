/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Test Tags', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const tagName = 'Etiqueta de peligro';
  let element;

  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    if(office === 'clouddistrict') {
      cy.clickOnModuleElement('Fichero', 'Clientes');
      element = 'clientes_propios'
    }
    if(['lopd', 'lopd-qa'].includes(office)) {
      cy.clickOnModuleElement('Fichero', 'Contactos principales');
      element = 'contactos_met'
    }
    cy.findAllByTestId('rowDetailLink').first().click();
  });

  it.skip('should create a new tag in the drawer list', () => {
    cy.get('.el-select.select-input').next().click();
    cy.interceptCrmRequest({
      method: 'POST',
      path: 'tags/clientes_propios',
      trigger: () => cy.get('.el-drawer__body').should('be.visible').find('h1').next().click(),
      callback: (body, status) => {
        expect(status).eq(201);
      },
    });
    cy.get('.el-table__row').last().as('newTag');
    cy.get('@newTag')
      .find('.cell')
      .then($cell => {
        cy.wrap($cell).eq(1).click();
        cy.wrap($cell).eq(1).clear().type(tagName);
        cy.get('.el-drawer__body').click('bottom');
        cy.wrap($cell).eq(1).invoke('val', tagName);
      });
  });

  it.skip('should change the color of the created tag in the drawer list', () => {
    cy.findByTestId('sectionTitle_Etiquetas').contains(/etiquetas/i);
    cy.get('.el-select.select-input').next().click();
    cy.get('.el-table__row').last().contains(tagName).parents('.el-table__row').as('tag');
    cy.get('@tag').find('.cell').first().click();
    cy.get('.el-popper[aria-hidden="false"]').find('.el-button--warning').click();
    cy.get('@tag').find('.cell .el-button--warning');
  });

  it.skip('should return to the previous value of the tag after changing it', () => {
    cy.findByTestId('sectionTitle_Etiquetas').contains(/etiquetas/i);
    cy.get('.el-select.select-input').next().click();
    cy.get('.el-table__row').contains(tagName).parents('.el-table__row').as('tag');
    cy.get('@tag')
      .find('.cell')
      .then($cell => {
        cy.wrap($cell).eq(1).click();
        cy.wrap($cell).eq(1).clear().type('Este cambio no queda al final');
        cy.get('.el-drawer__body').click('bottom');
        cy.wrap($cell).last().find('button').next().click();
        cy.wrap($cell).eq(1).invoke('val', tagName);
      });
  });

  it.skip('should delete the tag created in the drawe list', () => {
    cy.findByTestId('sectionTitle_Etiquetas').contains(/etiquetas/i);
    cy.get('.el-select.select-input').next().click();
    cy.get('.el-table__row')
      .last()
      .contains(tagName)
      .parents('.el-table__row')
      .then($tag => {
        cy.wrap($tag).find('.cell').last().find('button').click();
        cy.get('.el-message-box')
          .find('button')
          .contains(/confirmar/i)
          .click();
        cy.get('.el-message.el-message--success').then($messageSuccess => {
          cy.wrap($messageSuccess).should('be.visible');
          cy.wrap($messageSuccess).should('not.be.visible');
        });
      });
    cy.get('.el-table__row').last().contains(tagName).should('not.exist');
  });
});
