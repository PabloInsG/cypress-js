/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('Test emails list request has different payload for the first item on the list and for the last one', () => {
  let users: UserCredentialOptions;
  let previousId = null;
  let currentId = null;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.goToMails(office);
  });

  it(`Should load roundcube and user accounts in select`, () => {
    cy.interceptMailRequest<{ accountCollection: AccountCollection[] }>({
      path: 'accounts/accounts_links',
      trigger: () => cy.findRoundcube(),
      callback: (body, status, query) => {
        expect(status).to.eq(200);
        const defaultAccount = body.accountCollection.find(
          account => account.default,
        ) as AccountCollection;
        cy.get('#account-selector')
          .find('.el-select__selected-item.el-select__placeholder')
          .should('contain', defaultAccount.name);
      },
    });
  });
});
