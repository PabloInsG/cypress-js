/// <reference types="cypress" />

describe('Test All Filters', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  // Need to make a single test for each item to allow cypress load the page before each test
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

    officeModules.forEach((officeModule: string) => {
      it(`Test ${officeModule}`, () => {
        const module = modules.find(m => m.label === officeModule);
        if (!module) {
          cy.log('Module not found!');
          return;
        }
        cy.testOverModulElements(module, 'view/list/', body => {
          cy.findByTestId('allFiltersButton').click({ force: true }).parent();
          body.headers.forEach((header: ViewHeader) => {
            cy.findByTestId('allFilters')
              .find('span')
              .contains(header.elementProperty.label.replace('  ', ' '))
              .click({ force: true })
              .then(() => {
                const textSelector = '.column-drawer .el-drawer__body .el-radio__input.is-checked';
                const filterButtonSelector =
                  '.column-drawer .el-drawer__body .el-radio__input.is-checked';
                const humanizedFilterSelector = '.column-drawer .el-drawer__body .el-card';
                // probably we need here one test for each filter type
                switch (header.elementProperty.type) {
                  case 'Date':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'DateTime':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Time':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Year':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Duracion':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'CheckBox':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'AceptaCondiciones':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Color':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Documento':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'DocumentoEditable':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Flags':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'FormaPago':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'ListaBancos':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'ListaElemento':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'ListaElementoSelect':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'ListaGrupos':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'ListaGruposContables':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'ListaUsuarios':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Operacion':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Option':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'PrecioUnidades':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'RedesSociales':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'UserList':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Select':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'SelectMultiple':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Tags':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Moneda':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Autoincremental':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'int':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Cantidad':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'CodPostal':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'NumDecimal':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'NumEntero':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Geolocalizacion':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Email':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'CuentaBancaria':
                    cy.get(textSelector)
                      .parent()
                      .siblings()
                      .find('input')
                      .click({ force: true })
                      .type('prueba', { force: true });
                    cy.get('.el-select-dropdown__wrap').contains('prueba').click();
                    cy.get(filterButtonSelector)
                      .parent()
                      .siblings()
                      .find('button')
                      .click({ force: true });
                    cy.get(humanizedFilterSelector).contains(
                      header.elementProperty.label + ' contiene prueba',
                    );
                    cy.findByTestId('filter-group-delete-button').click();
                    break;
                  case 'Direccion':
                    cy.get(textSelector)
                      .parent()
                      .siblings()
                      .find('input')
                      .click({ force: true })
                      .type('prueba', { force: true });
                    cy.get('.el-select-dropdown__wrap').contains('prueba').click();
                    cy.get(filterButtonSelector)
                      .parent()
                      .siblings()
                      .find('button')
                      .click({ force: true });
                    cy.get(humanizedFilterSelector).contains(
                      header.elementProperty.label + ' contiene prueba',
                    );
                    cy.findByTestId('filter-group-delete-button').click();
                    break;
                  case 'Dni':
                    cy.get(textSelector)
                      .parent()
                      .siblings()
                      .find('input')
                      .click({ force: true })
                      .type('prueba', { force: true });
                    cy.get('.el-select-dropdown__wrap').contains('prueba').click();
                    cy.get(filterButtonSelector)
                      .parent()
                      .siblings()
                      .find('button')
                      .click({ force: true });
                    cy.get(humanizedFilterSelector).contains(
                      header.elementProperty.label + ' contiene prueba',
                    );
                    cy.findByTestId('filter-group-delete-button').click();
                    break;
                  case 'EnlaceIberley':
                    cy.get(textSelector)
                      .parent()
                      .siblings()
                      .find('input')
                      .click({ force: true })
                      .type('prueba', { force: true });
                    cy.get('.el-select-dropdown__wrap').contains('prueba').click();
                    cy.get(filterButtonSelector)
                      .parent()
                      .siblings()
                      .find('button')
                      .click({ force: true });
                    cy.get(humanizedFilterSelector).contains(
                      header.elementProperty.label + ' contiene prueba',
                    );
                    cy.findByTestId('filter-group-delete-button').click();
                    break;
                  case 'Link':
                    cy.get(textSelector)
                      .parent()
                      .siblings()
                      .find('input')
                      .click({ force: true })
                      .type('prueba', { force: true });
                    cy.get('.el-select-dropdown__wrap').contains('prueba').click();
                    cy.get(filterButtonSelector)
                      .parent()
                      .siblings()
                      .find('button')
                      .click({ force: true });
                    cy.get(humanizedFilterSelector).contains(
                      header.elementProperty.label + ' contiene prueba',
                    );
                    cy.findByTestId('filter-group-delete-button').click();
                    break;
                  case 'Skype':
                    cy.get(textSelector)
                      .parent()
                      .siblings()
                      .find('input')
                      .click({ force: true })
                      .type('prueba', { force: true });
                    cy.get('.el-select-dropdown__wrap').contains('prueba').click();
                    cy.get(filterButtonSelector)
                      .parent()
                      .siblings()
                      .find('button')
                      .click({ force: true });
                    cy.get(humanizedFilterSelector).contains(
                      header.elementProperty.label + ' contiene prueba',
                    );
                    cy.findByTestId('filter-group-delete-button').click();
                    break;
                  case 'Telefono':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'TextCorto':
                    cy.get(textSelector)
                      .parent()
                      .siblings()
                      .find('input')
                      .click({ force: true })
                      .type('prueba', { force: true });
                    cy.get('.el-select-dropdown__wrap').contains('prueba').click();
                    cy.get(filterButtonSelector)
                      .parent()
                      .siblings()
                      .find('button')
                      .click({ force: true });
                    cy.get(humanizedFilterSelector).contains(
                      header.elementProperty.label + ' contiene prueba',
                    );
                    cy.findByTestId('filter-group-delete-button').click();
                    break;
                  case 'TextoCorto':
                    cy.get(textSelector)
                      .parent()
                      .siblings()
                      .find('input')
                      .click({ force: true })
                      .type('prueba', { force: true });
                    cy.get('.el-select-dropdown__wrap').contains('prueba').click();
                    cy.get(filterButtonSelector)
                      .parent()
                      .siblings()
                      .find('button')
                      .click({ force: true });
                    cy.get(humanizedFilterSelector).contains(
                      header.elementProperty.label + ' contiene prueba',
                    );
                    cy.findByTestId('filter-group-delete-button').click();
                    break;
                  case 'TextInfo':
                    cy.get(textSelector)
                      .parent()
                      .siblings()
                      .find('input')
                      .click({ force: true })
                      .type('prueba', { force: true });
                    cy.get('.el-select-dropdown__wrap').contains('prueba').click();
                    cy.get(filterButtonSelector)
                      .parent()
                      .siblings()
                      .find('button')
                      .click({ force: true });
                    cy.get(humanizedFilterSelector).contains(
                      header.elementProperty.label + ' contiene prueba',
                    );
                    cy.findByTestId('filter-group-delete-button').click();
                    break;
                  case 'TextArea':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'TextAreaLong':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'EditorHtmlAvanzado':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'EditorHtmlAvanzadoLong':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'EditorHtmlSimple':
                    cy.findByTestId('buttonBack').click();
                    break;
                  case 'Imagen':
                    cy.findByTestId('buttonBack').click();
                    break;
                  default:
                    cy.findByTestId('buttonBack').click();
                    break;
                }
              });
          });
        });
      });
    });
  });
});
