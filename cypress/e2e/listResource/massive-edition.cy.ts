/// <reference types="cypress" />
import 'cypress-localstorage-commands';
import { adjectives, colors, Config, uniqueNamesGenerator } from 'unique-names-generator';

const customConfig: Config = {
  dictionaries: [adjectives, colors],
  separator: '-',
  length: 2,
};

describe('Test Massive Edition', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  context('hould make a massive edition and check that its ok', () => {
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
    officeModules.forEach((officeModule: string) => {
      it(`Test ${officeModule}`, () => {
        const module = modules.find(m => m.label === officeModule);
        if (!module) {
          cy.log('Module not found!');
          return;
        }
        console.log(module, 'module');
        cy.testOverModulElements(module, `view/mass_update/`, body => {
          cy.findByTestId('allFiltersButton').click({ force: true }).parent();
          body.headers.forEach((header: ViewHeader) => {
            cy.interceptCrmRequest<ElementRegistry[]>({
              path: `element_registries/${item.element}?(.+)&properties%5B1%5D`,
              callback: registriesBody => {
                console.log(registriesBody, 'registriesBody');
                const count = registriesBody.length;
                if (!count) return;
                // todo corregir variables inexistentes
                if (!massUpdateBody.headers.length) return;
                cy.get('thead tr').first().get('th.el-table__cell').should('not.have.text', '');
                cy.get('thead .el-table-column--selection .el-checkbox')
                  .click({ force: true })
                  .should('have.class', 'is-checked');
                cy.findByTestId('massiveEditionButton').click({ force: true });
                cy.findByTestId('massiveEditionAutocomplete').click({ force: true });
                massUpdateBody.headers.forEach(header => {
                  const label = header.elementProperty.label;
                  cy.get(
                    '.el-popper[aria-hidden=false] .el-autocomplete-suggestion__list',
                  ).contains(label);
                });
                if (
                  massUpdateBody.headers.some(header => header.elementProperty.label === 'Notas')
                ) {
                  cy.get('.el-popper[aria-hidden=false] .el-autocomplete-suggestion__list')
                    .contains('Notas')
                    .click({ force: true });
                  const shortName: string = uniqueNamesGenerator(customConfig);
                  cy.get('.ql-editor').type(shortName);
                  cy.interceptCrmRequest({
                    path: `element_register/mass/${item.element}/\\d+`,
                    method: 'PUT',
                    trigger: () =>
                      cy.findByTestId('massiveEditionUpdateButton').click({ force: true }),
                    callback: (body, status) => {
                      expect(status).to.eq(200);
                      // todo check updated value and column
                    },
                  });
                } else {
                  cy.findByTestId('massiveEditionCancelButton').click({ force: true });
                  // todo expect loader to not be present
                }
              },
            });
          });
        });
      });
    });
  });
});
