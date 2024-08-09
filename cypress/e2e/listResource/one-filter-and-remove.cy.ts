/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('Test One filter and remove it', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  context('Should check that the globalSearch implement 1 filter and allows to remove it', () => {
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
      it(`Test module ${item} - confirm uncheck/check columns`, () => {
        const module = modules.find(m => m.label === item);
        if (!module) {
          cy.log('Module not found!');
          return;
        }
        cy.testOverModulElements(module, 'view/global_quick_search/', body => {
          expect(status).to.eq(200);
          if (body.headers.length === 0) {
            cy.findByTestId('globalQuickSearch').should('not.exist');
            return;
          }
          cy.clickOnModuleElement(item.section, item.elementLabel);
          cy.findByTestId('globalQuickSearch').type('manu');
          cy.interceptCrmRequest({
            path: `element_registries/${item.element}?(.+)&properties%5B1%5D`,
            trigger: () => cy.findByTestId('quickSearchButton').click({ force: true }),
            callback: () => {
              cy.findByTestId('allFiltersButton').findByText('Todos los filtros(1)');
              cy.interceptCrmRequest({
                path: `element_registries/${item.element}?(.+)&properties%5B1%5D`,
                trigger: () => cy.get('.el-input__clear').click({ force: true }),
                callback: () => {
                  cy.findByTestId('quickSearchButton').click({ force: true });
                  cy.findByTestId('allFiltersButton').findByText('Todos los filtros');
                },
              });
            },
          });
        });
      });
    });
  });
});
