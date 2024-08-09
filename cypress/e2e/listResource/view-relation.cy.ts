/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('Test View Relation', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  context('Test to confirm if modules have expected breadcrumbs', () => {
    beforeEach(() => {
      cy.interceptCrmRequest<UserMenuResponse>({
        path: 'menus/me',
        trigger: () => cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword),
        callback: (body, status) => {
          expect(status).eq(200);
          modules = body.items;
        },
      });
    });

    officeModules.forEach(officeModule => {
      it(`Test module ${officeModule} - Should have correct relations`, () => {
        const module = modules.find(m => m.label === officeModule);
        if (!module) {
          cy.log('Module not found!');
          return;
        }
        cy.testOverModulElements(module, `view/list`, body => {
          console.log(body, 'body');
        });
      });
    });
  });
});
