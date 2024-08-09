/// <reference types="cypress" />

describe('', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  it('should save a new article with the correct concept', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnModuleElement('Gestión', 'Expedientes judiciales');
    cy.findByTestId('rowDetailLink').first().click();
    cy.goToRelationView('Cuentas', 'articulos_met');
    cy.contains('Lista de artículos');
    cy.get('button').contains('Añadir artículo').click();
    cy.get('.el-dialog ').as('modal');
    cy.get('@modal').find('.el-input').first().clear().type('Dorito');
    cy.get('@modal')
      .find('.el-form-item__content')
      .contains('Familia')
      .next()
      .find('.el-input__wrapper')
      .click();
    cy.get('.el-popper[aria-hidden="false"]')
      .find('.el-select-dropdown__item')
      .contains('Provision')
      .click({ force: true });
    cy.get('@modal').find('button').contains('Crear').as('button');
    cy.interceptCrmRequest({
      path: 'articles',
      trigger: () => cy.get('@button').click(),
      callback: (body, status) => {
        expect(status).eq(200);
        cy.get('.el-table__row')
          .first()
          .find('td')
          .eq(4)
          .find('input')
          .invoke('val')
          .then(value => {
            expect(value).eq('Provision', 'The article was saved with the correct concept');
          });
        cy.get('.el-table__row').first().find('td').last().find('button').first().click();
        cy.get('.el-dialog').find('button').contains('Ok').click();
      },
    });
  });
});
