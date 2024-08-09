/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('Test Menu', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  it('Should check modules in the menu', () => {
    let modules: string[];
    cy.interceptCrmRequest<UserMenuResponse>({
      path: 'menus/me',
      trigger: () => cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword),
      callback: (body, status) => {
        modules = body.items.map(item => item.label);
      },
    });
    cy.findByTestId('headerMenu')
      .find('.el-sub-menu')
      .each(($el, index, $list) => {
        if (modules.includes($el.text())) {
          expect(modules).to.include($el.text());
        } else {
          cy.wrap($el).trigger('mouseenter', { force: true });
          cy.get('.el-popper[aria-hidden="false"] .el-sub-menu .el-sub-menu__title')
            .should('be.visible')
            .each(($el, index, $list) => {
              expect(modules).to.include($el.text());
            });
        }
      });
  });
});
