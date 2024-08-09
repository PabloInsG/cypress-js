/// <reference types="cypress" />

describe('Client Element Test', () => {
  let users: UserCredentialOptions;
  let newClient: NewClient;
  const office = Cypress.env('despacho');

  beforeEach(() => {
    cy.fixture('users').then(data => (users = data));
    cy.fixture('new_client').then(data => (newClient = data));
    cy.intercept('POST', `${Cypress.env().crmUrl}element_register/clientes_propios`).as(
      'createdUser',
    );
  });
  it('should add a new client', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    // Go to the menu bar, click a module and select an element
    cy.clickOnModuleElement('Ficheros', 'Clientes');
    // click the button "Nuevo"
    cy.findByTestId('addElementDrawerButton').click();
    // fill the inputs
    cy.getInputByTestId('quickCreation-nombre').type(newClient.nombre);
    cy.getInputByTestId('quickCreation-email').type(newClient.email);
    cy.getInputByTestId('quickCreation-nif_cif').type(newClient.nif_cif);
    cy.getInputByTestId('quickCreation-telefono1').type(newClient.telephone);
    cy.findByTestId('createElementButton').click();
    // Waiting for API response
    cy.wait('@createdUser').then(({ request, response }) => {
      if (!response) throw new Error('The response is undefined');
      const newId = response.body.id;
      expect(response.statusCode, 'the status code shoul be 201 when you create a user').to.equal(
        201,
      );
      expect(response.body.message, 'the message from server should be "Created!"').to.equal(
        'Created!',
      );
      cy.url().should(
        'eq',
        `${Cypress.env().baseUrl}/${office}/ficheros/clientes-propios/${newId}`,
      );
    });
    // Check the outputs from the webpage
    cy.findByTestId('renderer_nombre').contains(newClient.nombre);
    cy.findByTestId('renderer_email').contains(newClient.email);
    cy.findByTestId('renderer_nif_cif').contains(newClient.nif_cif);
    cy.findByTestId('renderer_telefono1').contains(newClient.telephone);
  });
});
