/// <reference types="cypress" />

describe('Test create Contact from related element Clientes', () => {
  let users: UserCredentialOptions;
  let newClient: NewClient;
  const office = Cypress.env('despacho');
  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });
  before(() => {
    cy.fixture('new_client').then(data => {
      newClient = data;
    });
  });
  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: 'element_registries/clientes_propios?',
      trigger: () => cy.clickOnModuleElement('Ficheros', 'Clientes'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: 'element_register/clientes_propios/?',
      trigger: () => cy.findByTestId('rowDetailLink').first().click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'element_registries/contactos?',
      trigger: () => cy.findByTestId('detail_view_section_tab__Contactos').click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });
  it('should add a new contact related to current client', () => {
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'element_registries/contactos?',
      trigger: () => cy.findByTestId('addElementDrawerButton').click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.get('.el-drawer__body:visible');
    cy.getInputByTestId('quickCreation-nombre').type(newClient.nombre);
    cy.getInputByTestId('quickCreation-email').type(newClient.email);
    cy.getInputByTestId('quickCreation-movil').type(newClient.movil);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      method: 'POST',
      path: 'relation_element/clientes_propios/?',
      trigger: () => cy.findByTestId('createElementButton').click(),
      callback: (response, status) => {
        if (!response) throw new Error('The response is undefined');
        expect(status, 'the status code should be 201 when you create a user').to.equal(201);
        expect(response, 'the message from server should be "Created!"').to.equal('Created!');
      },
    });
  });
});
