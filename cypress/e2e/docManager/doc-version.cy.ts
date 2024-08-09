/// <reference types="Cypress"/>

describe('Test Doc Manager', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  let id;

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.goToDocManager(office);
    cy.get('.el-table-v2__row').find('.document-checkbox').first().then($checkbox => {
      cy.wrap($checkbox).find('input').invoke('attr', 'id').then($id => {
        const stringSplited = $id?.split('-')
        id = stringSplited![stringSplited!.length - 1]
      })
    });
  });

  it('Should display all existing folders in the navigation panel', () => {
    cy.interceptDocManagerRequest({
      path: `files/${id}/versions`,
      trigger: () => cy.get('.el-table-v2__row').find('.document-checkbox').first().click(),
      callback: (body, status) => {
        expect(status).equal(200);
        cy.findByTestId('colapse-button-metadata').click();
        cy.get('.el-collapse-item__header').contains('Versiones').click();
        cy.findByTestId('doc-version-table').then($table => {
          cy.wrap($table).find('.el-table__row').should('have.length', body.versions.length);
        })
      }
    })
  });
});
