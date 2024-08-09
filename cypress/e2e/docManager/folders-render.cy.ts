/// <reference types="Cypress"/>

describe('Test Doc Manager', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const module = office === 'lopd-qa' ? 'Utilidades' : 'Gestor Documental';

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.goToDocManager(office);
  });

  it('Should display all existing folders in the navigation panel', () => {
    cy.interceptDocManagerRequest<Enum[]>({
      path: 'folders/1?',
      callback: body => {
        body.forEach(item => {
          cy.findByTestId('folder-id-' + item.id);
        });
      },
    });
  });
});
