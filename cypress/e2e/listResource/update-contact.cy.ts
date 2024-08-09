/// <reference types="cypress" />

describe('Contact Element Test', () => {
  let users: UserCredentialOptions;
  let contact: NewMetContact;
  const office = Cypress.env('despacho');
  const element = 'contactos-met';

  beforeEach(() => {
    cy.fixture('users').then(data => (users = data));
    cy.fixture('new_contact_met').then(data => (contact = data));
  });

  it('should update a contact in drawer', () => {
    // todo necesitamos crear un contacto para poder actualizarlo ya que no se encuentra ninguno con la búsqueda de test
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnModuleElement('Fichero', 'Contactos principales');
    cy.findAllByTestId('globalQuickSearch').clear().type('test');
    cy.findAllByTestId('quickSearchButton').click();
    cy.updateRegister(contact, element);
  });
});
