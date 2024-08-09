/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('ListResource - Global Quick Search ', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  context('Global quick search tooltips', () => {
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
      it(`Test module ${officeModule}`, () => {
        const module = modules.find(m => m.label === officeModule);
        if (!module) {
          cy.log('Module not found!');
          return;
        }
        cy.testOverModulElements(module, 'view/global_quick_search/', body => {
          if (body.headers.length === 0) {
            cy.findByTestId('globalQuickSearch').should('not.exist');
            return;
          }
          cy.findByTestId('globalQuickSearch').click({ force: true });
          cy.get('.globalQuickSearchTooltip').as('tooltip');
          cy.get('@tooltip')
            .should('exist')
            .should(value => {
              body.headers
                .map(el => el.elementProperty.label)
                .forEach(item => {
                  expect(value).to.contain(item);
                });
            });
          cy.findByTestId('quickSearchButton').click();
          cy.get('@tooltip').should('not.exist');
        });
      });
    });
  });
});
