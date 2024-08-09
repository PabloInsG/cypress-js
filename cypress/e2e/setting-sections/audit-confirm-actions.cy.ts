/// <reference types="cypress" />

describe('Test audit', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  it('It should check that the request for actions is made and actions are present', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings');
    cy.interceptCrmRequest<ViewActionResponse>({
      path: 'view/enums/logs_actividad/accion',
      trigger: () => cy.clickOnSubMenuAsideSettings('Auditoria'),
      callback: (body, status) => {
        expect(status).equal(200, 'The response is ok');
        const actions = body.enums.map(enumItem => enumItem.label);
        cy.contains(/action/i).click();
        cy.get('.el-popper[aria-hidden="false"]')
          .find('.el-select-dropdown')
          .then($select => {
            cy.wrap($select).find('.el-select-dropdown__list').as('listOfAction');
            cy.wrap($select).find('.el-virtual-scrollbar').as('scroll');
          });
        actions.forEach(action => {
          cy.get('@listOfAction').contains(action);
          // scroll down
          cy.get('@scroll')
            .find('.el-scrollbar__thumb')
            .then($scrollbar => {
              cy.wrap($scrollbar).trigger('mousedown', { clientY: 0 });
              cy.wrap($scrollbar).trigger('mousemove', { clientY: 8 });
              cy.wrap($scrollbar).trigger('mouseup');
            });
        });
      },
    });
  });
});
