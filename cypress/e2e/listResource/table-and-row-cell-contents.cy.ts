/// <reference types="cypress" />
import 'cypress-localstorage-commands';
import { isEmptyOrNotDefined } from 'cypress/lib/utils';
import { format } from 'date-fns';

var striptags = require('striptags');

describe('Test Table and row/cell contents', () => {
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

    officeModules.forEach(item => {
      context(`Test ${item.section}, ${item.element}`, () => {
        before(() => {
          cy.open();
        });
        it(`Should have a table with results`, () => {
          cy.interceptCrmRequest<ElementRegistry[]>({
            path: `element_registries/${item.element}?(.+)&properties%5B1%5D`,
            trigger: () => cy.clickOnModuleElement(item.section, item.elementLabel),
            callback: (body, status) => {
              expect(status).to.eq(200);
              const count = body.length;
              cy.findByTestId('main-table')
                .find('.el-table__body .el-table__row')
                .should('have.length', count);
              body.forEach((item, i) => {
                item.values.forEach(elementRegistry => {
                  const value = elementRegistry.label || elementRegistry.value;
                  const propertyName = elementRegistry.property.name;
                  const cellSelector = `.el-table__body .el-table__row:nth-child(${
                    i + 1
                  }) .el-table__cell .component-renderer[name="${propertyName}"]`;
                  if (
                    ['CheckBox', 'AceptaCondiciones'].includes(
                      elementRegistry.property.elementProperty.type,
                    )
                  ) {
                    cy.findByTestId(`list-resource-table`)
                      .find(cellSelector)
                      .should(
                        'have.css',
                        'color',
                        elementRegistry.value === '1' ? 'rgb(0, 128, 0)' : 'rgb(255, 0, 0)',
                      );
                    return;
                  }
                  if (isEmptyOrNotDefined(value)) {
                    cy.findByTestId(`list-resource-table`).find(cellSelector).should('be.empty');
                    return;
                  }
                  if (['Select', 'Enum'].includes(elementRegistry.property.elementProperty.type)) {
                    if (elementRegistry.value === '1') {
                      cy.findByTestId(`list-resource-table`)
                        .find(cellSelector)
                        .should('contain', 'Sin Asignar');
                    }
                    return;
                  }
                  if (
                    ['Date', 'DateTime'].includes(elementRegistry.property.elementProperty.type)
                  ) {
                    cy.findByTestId(`list-resource-table`)
                      .find(cellSelector)
                      .should('contain', format(new Date(value), 'PPPP'));
                    return;
                  }
                  if (value) {
                    cy.findByTestId(`list-resource-table`)
                      .find(cellSelector)
                      .should('contain', striptags(value));
                    return;
                  }
                });
              });
            },
          });
        });
      });
    });
  });
});
