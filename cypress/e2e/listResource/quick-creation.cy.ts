/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('Test Quick creation', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  context('Test view QUICK CREATION', () => {
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

    officeModules.forEach(item => {
      context(`Test ${item.section}, ${item.element}3`, () => {
        const module = modules.find(m => m.label === item);
        if (!module) {
          cy.log('Module not found!');
          return;
        }
        cy.testOverModulElements(module, 'view/quick_creation/', body => {
          cy.findByTestId('addElementDrawerButton').click({ force: true });
          body.headers.forEach(header => {
            cy.findByTestId(`quickCreation-${header.name}`).should(
              'contain',
              header.elementProperty.label,
            );
          });
          cy.get('.el-drawer__close-btn').click({ multiple: true, force: true });
        });
      });
    });
  });
});
