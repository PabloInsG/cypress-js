/// <reference types="cypress" />
import 'cypress-localstorage-commands';
import { getRandomNumber } from 'cypress/lib/utils';

describe('Test column headers', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');
  const columnsToAdd = 3;
  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

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
    it(`Test module ${officeModule} - Create and delete columns`, () => {
      const module = modules.find(m => m.label === officeModule);
      if (!module) {
        cy.log('Module not found!');
        return;
      }
      cy.testOverModulElements(module, 'view/list/', body => {
        const selectedColumnsToDelete: ViewHeader[] = [];
        const unselectedColumns = body.headers.filter(header => !header.elementProperty.enabled);
        const NumberOfColumns = unselectedColumns.length;
        cy.findByTestId('dropdown-menu-actions').click();
        cy.findByTestId('configuration-button').click();
        let i = 0;
        while (i < columnsToAdd) {
          const randomNumberForSelectingColumn = getRandomNumber(0, NumberOfColumns);
          const selectedColumn = unselectedColumns[randomNumberForSelectingColumn];
          if (selectedColumnsToDelete.includes(selectedColumn)) return;
          cy.findByTestId(`column_${selectedColumn.name}`);
          cy.findByTestId(`checkbox_column_${selectedColumn.name}`).click();
          selectedColumnsToDelete.push(selectedColumn);
          i++;
        }
        selectedColumnsToDelete.forEach(column => {
          cy.findByTestId(`selected-column_${column.name}`).should('exist');
        });
        cy.interceptCrmRequest<ListViewBody>({
          path: `view/list/${body.elementId.value}`,
          trigger: () => cy.findByTestId('config-save-button').click(),
          callback: (body, status) => {
            expect(status).eq(200);
            cy.get('.el-table__body').find('thead tr').first().as('row');
            selectedColumnsToDelete.forEach(column => {
              cy.get('@row').contains(column.elementProperty.label);
            });
          },
        });
        cy.findByTestId('dropdown-menu-actions').click();
        cy.findByTestId('configuration-button').click();
        selectedColumnsToDelete.forEach(column => {
          cy.findByTestId(`selected-column_${column.name}`).contains(column.elementProperty.label);
          cy.findByTestId(`selected-column_${column.name}`).find('button').click();
        });
        selectedColumnsToDelete.forEach(column => {
          cy.findByTestId(`column_${column.name}`).contains(column.elementProperty.label);
          cy.findByTestId(`checkbox_column_${column.name}`).should('not.be.checked');
        });
        cy.interceptCrmRequest({
          method: 'POST',
          path: `view/list/${body.elementId.value}`,
          trigger: () => cy.findByTestId('config-save-button').click(),
          callback: (body, status) => {
            expect(status).eq(201);
            cy.get('.el-table__body').find('thead tr').first().as('row');
            selectedColumnsToDelete.forEach(column => {
              cy.get('@row').contains(column.elementProperty.label).should('not.exist');
            });
          },
        });
      });
    });
  });
});
