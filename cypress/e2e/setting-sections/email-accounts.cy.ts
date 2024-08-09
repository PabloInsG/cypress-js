/// <reference types="cypress" />

describe('Test email accounts', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const defaultMap = {
    true: '#00cc00',
    false: '#cc0000',
  };
  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  it('should check emails', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings');
    cy.interceptMailRequest<EmailAccountResponse>({
      path: 'accounts/accounts_links',
      trigger: () => cy.clickOnSubMenuAsideSettings('Cuentas de email'),
      callback: (body, status) => {
        const emailAccounts = body.accountCollection;
        emailAccounts.forEach(email => {
          cy.get('.el-table__row').contains(email.name);
        });
      },
    });
  });
});
