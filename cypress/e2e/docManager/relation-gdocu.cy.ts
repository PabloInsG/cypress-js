/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Detail View gdocu relation', () => {
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

  it('Should have a filter with the relation', () => {
    cy.getFirstOfDocsList().click();
    // todo ¿qué debería hacer este test?
    /*cy.interceptCrmRequest({
      path: 'element_registries/gdocu?',
      trigger: () => cy.goToRelationView('Historial', 'gdocu'),
      callback: (body, status) => {
        expect(status).equal(200);
        cy.findByTestId('folder-id-1').click();
      },
    });*/
  });
});
