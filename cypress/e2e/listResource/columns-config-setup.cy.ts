/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Test Columns Config Setup', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  context('Should open configuration and have both columns setup correctly', () => {
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
      it(`Test module ${officeModule} - open configuration and columns setup`, () => {
        const module = modules.find(m => m.label === officeModule);
        if (!module) {
          cy.log('Module not found!');
          return;
        }
        cy.testOverModulElements(module, 'view/list/', body => {
          cy.findByTestId('dropdown-menu-actions').click({ force: true });
          cy.findByTestId('configuration-button').click({ force: true });
          cy.findByTestId('config-wrapper').should('exist');
          body.headers.forEach(header => {
            // column should exist at left side
            cy.findByTestId('all-columns')
              .findByTestId('column_' + header.name)
              .find('p')
              .should('contain', header.elementProperty.label);
            if (header.elementProperty.firstField) {
              cy.findByTestId('all-columns')
                .findByTestId('column_' + header.name)
                .find('.el-checkbox')
                .should('have.class', 'is-checked')
                .should('have.class', 'is-disabled');
            } else if (header.elementProperty.enabled) {
              // if enabled, column should be checked
              cy.findByTestId('all-columns')
                .findByTestId('column_' + header.name)
                .find('.el-checkbox')
                .should('have.class', 'is-checked');
              // if enabled, column should exist at left
              cy.findByTestId('selected-columns')
                .findByTestId('selected-column_' + header.name)
                .should('exist');
            } else {
              // if not enabled, column must not be checked
              cy.findByTestId('all-columns')
                .findByTestId('column_' + header.name)
                .find('.el-checkbox')
                .should('not.have.class', 'is-checked');
              //if not enabled, column must not exist at right
              cy.findByTestId('selected-columns')
                .findByTestId('selected-column_' + header.name)
                .should('not.exist');
            }
          });
        }),
          cy.get('.el-dialog__headerbtn').click({ force: true });
      });
    });
  });
});
