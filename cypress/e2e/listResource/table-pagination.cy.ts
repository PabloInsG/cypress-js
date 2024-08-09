/// <reference types="cypress" />

describe('Test Table pagination', () => {
  let users: UserCredentialOptions;
  let modules: CrmMenuItem[];
  const officeModules = Cypress.env('officeModules').split(',');
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => (users = data));
  });
  context('Test to confirm if modules have expected breadcrumbs', () => {
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
    officeModules.forEach(item => {
      context(`Test ${item.section}, ${item.element}`, () => {
        before(() => {
          cy.open();
        });
        it('should test pagination in tables', () => {
          // todo test pagination in tables
          /* This test should check the number of pages according to the total number of elements
        Also, it should test changing the number of elements per page.
        When total element registries is less than 100, this test should check every page
        write the test below this comment
         */
        });
      });
    });
  });
});
