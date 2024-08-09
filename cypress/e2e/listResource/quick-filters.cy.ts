/// <reference types="cypress" />

import 'cypress-localstorage-commands';
import { isBooleanFilter, isDatepickerFilter, isSelectFilter } from '../../lib/utils';

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
  context('Quick filters exist', () => {
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
        cy.testOverModulElements(module, 'view/quick_filters/', body => {
          body.headers.forEach(header => {
            const selector = isBooleanFilter(header)
              ? '.filter-link .el-checkbox__label'
              : '.filter-link p';
            cy.findByTestId(`quickFilter-${header.name}`)
              .find(selector)
              .should('contain', header.elementProperty.label);
          });
        });
      });
    });
  });

  context('Filter by each quick filter', () => {
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
        // todo el select de contato no tiene opciones
        const module = modules.find(m => m.label === officeModule);
        if (!module) {
          cy.log('Module not found!');
          return;
        }
        cy.testOverModulElements(module, 'view/quick_filters/', body => {
          body.headers.forEach(header => {
            const isBoolean = isBooleanFilter(header);
            const isSelect = isSelectFilter(header);
            const isDatepicker = isDatepickerFilter(header);
            const popper = '.el-popper[aria-hidden=false]';
            const quickFilterSelector = isBoolean
              ? '.filter-link .el-checkbox__label'
              : '.filter-link p';
            cy.findByTestId(`quickFilter-${header.name}`).find(quickFilterSelector).click();
            cy.get(popper + '.quick-filter')
              .first()
              .click();
            cy.get(popper)
              .last()
              .click()
              .within(() => {
                if (isSelect) {
                  cy.get('.el-select-dropdown li').first().click();
                }
                if (isDatepicker) {
                  cy.get('table').find('td').last().click();
                }
                cy.get('button[data-testid=filterButton]').first().click();
                cy.get('div').findByText('(1)').should('exist');
              });
            cy.get('div.filter-link').findByText('(1)').should('exist');
            cy.get(popper + '.quick-filter')
              .click()
              .within(() => {
                cy.get('button.closeCross').click();
                cy.get('div').findByText('(1)').should('not.exist');
              });
            cy.get('div.filter-link').findByText('(1)').should('not.exist');
          });
        });
      });
    });
  });
});
