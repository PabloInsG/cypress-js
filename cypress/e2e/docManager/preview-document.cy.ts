/// <reference types="cypress" />

describe('Test Gestor Documental - Previsualizar un documento', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.goToDocManager(office);
  });

  it('Should open preview of a document', () => {
    cy.getFirstOfDocsList()
      .find('.document-name')
      .then(el => {
        const fileName = el[0]?.innerText;
        cy.getFirstOfDocsList().find('.document-name').find('.el-button').click();
        cy.get('.wrapper-modal-dialog[data-testid="preview-modal"]').should('be.visible');
        cy.get('.wrapper-modal-dialog[data-testid="preview-modal"]').within(() => {
          cy.findByText(fileName);
          cy.get('#ep-wrapper-modal__close-button').click();
        });
      });
  });
});
