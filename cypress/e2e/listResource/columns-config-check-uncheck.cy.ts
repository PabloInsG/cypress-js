/// <reference types="cypress" />
import 'cypress-localstorage-commands';
import { selectRandomElementsFromArray } from 'cypress/lib/utils';

describe('Test - Column headers', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  context('Test to confirm whether the columns are checked or unchecked', () => {
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
      it(`Test module ${officeModule} - confirm uncheck/check columns`, () => {
        const module = modules.find(m => m.label === officeModule);
        if (!module) {
          cy.log('Module not found!');
          return;
        }
        cy.testOverModulElements(module, 'view/list/', body => {
          const columns = selectRandomElementsFromArray(body.headers, 5);
          const selectedColumns = body.headers.filter(
            header => header.elementProperty.enabled === true,
          );
          cy.findByTestId('dropdown-menu-actions').click();
          cy.findByTestId('configuration-button').click();
          cy.findByTestId('config-wrapper').should('exist');
          columns.forEach(column => {
            const name = column.name;
            const label = column.elementProperty.label;
            const isEnabled = column.elementProperty.enabled;
            const cleanedLabel = new RegExp(`^${label.replace(/\s/g, '\\s*')}$`);
            cy.findByTestId(`column_${name}`).contains(cleanedLabel).should('exist');
            cy.findByTestId(`checkbox_column_${name}`)
              .should(isEnabled ? 'have.class' : 'not.have.class', 'is-checked')
              .find('input[type="checkbox"]')
              .should(isEnabled ? 'be.checked' : 'not.be.checked');
          });
          selectedColumns.forEach(column => {
            const name = column.name;
            const label = column.elementProperty.label;
            const isFirstField = column.elementProperty.firstField;
            const cleanedLabel = new RegExp(`^${label.replace(/\s/g, '\\s*')}$`);
            if (isFirstField) {
              cy.findByTestId('selected-columns').contains(cleanedLabel);
              return;
            }
            cy.findByTestId(`selected-column_${name}`);
          });
          cy.findByTestId('config-cancel-button').click();
        });
      });
    });
  });
});
