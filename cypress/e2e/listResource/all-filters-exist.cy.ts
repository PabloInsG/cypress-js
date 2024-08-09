/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Test list resource', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });
  context(`All filters should exist`, () => {
    beforeEach(() => {
      cy.log('intercept request', `${Cypress.env().crmUrl}menus/me`);
      cy.intercept('GET', `${Cypress.env().crmUrl}menus/me`).as('getMenu');
      cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
      cy.wait('@getMenu').then(({ response, request }) => {
        const body = response!.body as UserMenuResponse;
        modules = body.items;
      });
    });
    officeModules.forEach(officeModule => {
      it(`Test module ${officeModule}`, () => {
        const module = modules.find(m => m.label === officeModule);
        if (!module) {
          cy.log('Module not found!');
          return;
        }
        cy.testOverModulElements(module, 'view/list/', body => {
          cy.findByTestId('allFiltersButton').click({ force: true });
          cy.findByTestId('allFilters').should('be.visible').as('allFilters');
          body.headers.forEach(header => {
            cy.get('@allFilters').contains(header.elementProperty.label.replace('  ', ' '));
          });
          cy.get('.el-drawer.open')
            .find('.el-drawer__header .el-drawer__close-btn')
            .click({ force: true });
        });
      });
    });
  });
});
