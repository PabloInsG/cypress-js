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
  context('Columns should have correct order', () => {
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
        cy.testOverModulElements(module, 'view/list/', body => {
          const viewHeaders: ViewHeader[] =
            body.headers.sort((a, b) =>
              a.elementProperty.firstField ? -1 : b.elementProperty.firstField ? 1 : 0,
            ) || [];
          const lastEnabled = viewHeaders.findLast(vh => vh.elementProperty.enabled);
          cy.get('#ep-main-table')
            .find('thead tr th.el-table__cell .cell')
            .last()
            .contains(lastEnabled!.elementProperty.label);
          cy.get('#ep-main-table')
            .find('thead tr th.el-table__cell .cell')
            .then(domColumns => {
              const columns = Array.from(domColumns).map(col => col.innerText);
              columns.forEach((col, idx) => {
                if (idx > 0) {
                  const header = viewHeaders.find(header => header.elementProperty.label === col);
                  const headerIndex = viewHeaders.findIndex(
                    header => header.elementProperty.label === col,
                  );
                  expect(headerIndex).to.gte(0);
                  if (header?.elementProperty.firstField) {
                    expect(idx).to.equal(1);
                  } else {
                    expect(idx - 1).to.lte(headerIndex);
                  }
                }
              });
            });
        });
      });
    });
  });
});
