/// <reference types="cypress" />

describe('Test audit', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const companyName = 'Empresa prueba Cypress - borrar';

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings');
  });

  it('should check that companies are in the list', () => {
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'companies',
      trigger: () => cy.clickOnSubMenuAsideSettings('Empresas'),
      callback: (body, status) => {
        expect(status).equal(200);
        body.elementRegistries.forEach(registry => {
          const companyName = registry.values.find(
            item => item.property.name === 'nombre_grupocontable',
          )?.value;
          cy.get('.el-table__row').contains(companyName!);
        });
      },
    });
  });

  it.skip('should create a new company', () => {
    cy.clickOnSubMenuAsideSettings('Empresas');
    cy.findByTestId('addElementDrawerButton').click();
    cy.get('.el-form-item__label')
      .contains(/nombre/i)
      .next()
      .find('input')
      .type(companyName);
    cy.interceptCrmRequest({
      method: 'POST',
      path: 'company',
      trigger: () => cy.findByTestId('createElementButton').click(),
      callback: (body, status) => {
        expect(status).equal(200);
        cy.get('.el-notification').should('exist');
      },
    });
  });

  it.skip('should delete the company created', () => {
    cy.clickOnSubMenuAsideSettings('Empresas');
    cy.get('.el-table__row')
      .contains(companyName)
      .parents('.el-table__row')
      .find('.el-table__cell .el-checkbox__input')
      .click();
    cy.findByTestId('selectedRowDelete').click();
    cy.get('.el-dialog__body').then($el => {
      cy.wrap($el).find('.el-input__inner').type('1');
      cy.wrap($el).find('.el-button').contains(/ok/i).click();
    });
    cy.get('.el-message ').should('exist');
  });
});
