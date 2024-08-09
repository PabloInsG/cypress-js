/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Test import lexnet zip', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const fileName = 'NOTIS';
  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'element_registries/lexnet?',
      trigger: () => cy.clickOnModuleElement('Comunicaciones', 'Lexnet'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });
  it(`Test successfully upload lexnet zip and get successful response`, () => {
    cy.findByTestId('dropdown-menu-actions').click();
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      method: 'POST',
      path: 'lexnet/import',
      trigger: () =>
        cy
          .findByTestId('import-lexnet-button')
          .find('.el-upload__input')
          .selectFile(`cypress/fixtures/${fileName}.zip`, { force: true }),
      callback: (body, status) => {
        expect(status).to.eq(201);
      },
    });
  });
});
