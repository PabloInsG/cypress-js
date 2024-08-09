/// <reference types="cypress" />
import 'cypress-localstorage-commands';
import 'cy-verify-downloads';

describe('Exports', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.get('.el-sub-menu').first().trigger('mouseenter', { force: true})
    cy.get('.el-popper[aria-hidden="false"]').should('be.visible').find('.el-menu-item').first().click()
    cy.get('body').click();
  });

  it('should downloads a file cvs with name changed', () => {
    cy.checkDownloadFile('prueba1', 'csv');
  });

  it('should downloads a file xlsx with name changed', () => {
    cy.checkDownloadFile('prueba2', 'xlsx');
  });
});
