/// <reference types="cypress" />

describe('Test Enums Settings', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const module = 'Actuaciones';
  const optionEnum = 'Estado';

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  it('Should check enum list of task', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings');
    cy.clickOnSubMenuAsideSettings('Enums');
    cy.findByTestId('moduleSelect').then($el => {
      cy.wrap($el).click();
      cy.wrap($el).type(module);
      cy.wait(200);
      cy.get('.el-select-dropdown__item').contains(module).click();
    });
    cy.findByTestId('enumSelect').click();
    cy.interceptCrmRequest<EnumListResponse>({
      path: 'view/enums/actuaciones/Estado',
      trigger: () => cy.get('.el-select-dropdown__item').contains(optionEnum).click(),
      callback: (body, status) => {
        expect(status).equal(200);
        cy.get('#tab-fieldTypes').click();
        cy.get('.el-tree')
          .find('.el-tree-node')
          .each(($el, index, $list) => {
            cy.wrap($el)
              .find('.el-tree-node__content')
              .invoke('text')
              .then(text => {
                const enumItem = body.enums.find(item => item.label == text)?.label;
                expect(enumItem).equal(text);
              });
          });
      },
    });
  });
});
