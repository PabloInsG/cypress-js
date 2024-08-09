/// <reference types="cypress" />

describe('Test audit', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const groupName = 'Grupo de prueba Cypress - Borrar';
  const groupDescription = 'descripcion de prueba para Cypress';

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings');
    cy.clickOnSubMenuAsideSettings('Grupos');
  });

  it('should check that the delete button is desabled when no group is selected', () => {
    cy.get('.el-checkbox__input').each(($el, index, $list) => {
      cy.wrap($el).should('not.have.class', 'is-checked');
    });
    cy.findByTestId('delete-group').should('have.class', 'is-disabled');
  });

  it('should create a new group and check that it was created', () => {
    cy.wait(5000)
    cy.findByTestId('add-group').click();
    cy.get('.el-dialog__body').then($el => {
      cy.wrap($el).contains('Nombre de grupo').next().find('input').type(groupName);
      cy.wrap($el).contains('Descripción').next().find('input').type(groupDescription);
    });
    cy.interceptCrmRequest({
      method: 'POST',
      path: 'group',
      trigger: () => cy.get('.el-button.el-button--primary').contains('Crear').click(),
      callback: (body, status) => {
        expect(status).eq(201);
        cy.get('.el-tree-node').contains(groupName);
      },
    });
  });

  it('should delete the group created', () => {
    cy.get('.el-tree-node').contains(groupName).click();
    cy.findByTestId('delete-group').should('not.have.class', 'is-disabled').click();
    cy.get('.el-message-box').should('exist');
    cy.interceptCrmRequest({
      method: 'DELETE',
      path: 'group/*',
      trigger: () => cy.get('.el-message-box__btns').contains(/ok/i).click(),
      callback: (body, status) => {
        expect(status).eq(200);
        cy.get('.el-notification').should('exist').contains('Borrado completado');
      },
    });
  });
});
