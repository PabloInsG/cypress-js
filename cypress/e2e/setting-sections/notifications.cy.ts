/// <reference types="cypress" />

describe('Test Profile user', () => {
  const office = Cypress.env('despacho');
  let users: UserCredentialOptions;
  before(() => {
    cy.fixture('users').then(data => (users = data));
  });

  it('should check that the notifications are present', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnUserSettings('userMenu_settings');
    cy.interceptCrmRequest<NotificationsResponse[]>({
      path: 'notifications/me',
      trigger: () => cy.get('.el-menu-item[role="menuitem"]').contains('Notificaciones').click(),
      callback: (body, status) => {
        cy.wrap(status).should(
          'eq',
          200,
          'The response of the request should have a status code of 200',
        );
        cy.get('.el-collapse-item').each($el => {
          cy.wrap($el).click();
          cy.wrap($el)
            .invoke('attr', 'data-testid')
            .then($dataid => {
              const filteredItems = body.filter(d => d.element === $dataid);
              filteredItems.forEach(item => {
                cy.get('.el-collapse-item.is-active')
                  .contains(item.label)
                  .should('be.visible')
                  .then($item => {
                    cy.wrap($item)
                      .find('input')
                      .should(item.enable ? 'be.checked' : 'not.be.checked');
                  });
              });
            });
        });
      },
    });
  });
});
