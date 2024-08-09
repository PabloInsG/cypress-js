/// <reference types="cypress" />

describe('Test audit', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
    cy.intercept(`${Cypress.env().crmUrl}audit/clientes_propios`).as('auditResponse');
  });

  it('should be a list of items', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings').click();
    cy.interceptCrmRequest<ViewActionResponse>({
      path: '*audit/*',
      trigger: () => cy.clickOnSubMenuAsideSettings('Auditoria'),
      callback: (body, status) => {
        expect(status).eq(200);
        if(body.auditRegistersCollection.length) {
          cy.get('.el-table-v2__row[role="row"]').should($rows => {
            expect($rows.length).to.be.greaterThan(0);
          });
          return;
        }
        cy.get('.el-empty').contains('Sin Datos');
      },
    });
  });
});
