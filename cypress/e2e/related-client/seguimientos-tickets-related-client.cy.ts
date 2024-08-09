/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test create, edit and delete trackings inside a client ', () => {
  let users: UserCredentialOptions;
  let client: NewClient;
  let ticket: NewTicket;
  const relatedElement = 'clientes_propios';
  const element = 'tickets';
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
    cy.fixture('new_client').then(data => {
      client = data;
    });
    cy.fixture('new_ticket').then(data => {
      ticket = data;
    });
  });

  beforeEach(() => {
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: 'menus/me',
      trigger: () => cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: `element_registries/${relatedElement}?`,
      trigger: () => cy.clickOnModuleElement('Ficheros', 'Cliente'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });

  it('should create a new client and a new test ticket', () => {
    cy.quickCreateRegister(client, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}/`,
      trigger: () => cy.goToRelationView('Historial', element),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.createTicket(ticket);
  });

  it('should verify that can create new tracking', () => {
    cy.globalCrmSearch(client.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}/?`,
      trigger: () => cy.goToRelationView('Historial', element),
      callback: (response, status) => {
        expect(status).to.eq(200);
        console.log(response);
      },
    });
    cy.globalCrmSearch(ticket.subject, element);
    cy.get('body').click({ force: true });
    cy.interceptCrmRequest<ElementRegistries>({
      path: `element_registries/seguimientos?`,
      trigger: () => cy.findByTestId('preview-drawer-button').first().click(),
      callback: (body, status) => {
        expect(status).eq(200);
      },
    });
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: 'element_registries/seguimientos?',
      trigger: () => cy.createTracking(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });

  it('should verify that can edit a tracking', () => {
    cy.globalCrmSearch(client.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}/?`,
      trigger: () => cy.goToRelationView('Historial', element),
      callback: (response, status) => {
        expect(status).to.eq(200);
        console.log(response);
      },
    });
    cy.globalCrmSearch(ticket.subject, element);
    cy.get('body').click({ force: true });
    cy.interceptCrmRequest<ElementRegistries>({
      path: `element_registries/${element}?`,
      trigger: () => cy.findByTestId('preview-drawer-button').first().click(),
      callback: (body, status) => {
        expect(status).eq(200);
      },
    });
    cy.updateTrackingFromTickets();
  });

  it('should verify that can delete a tracking', () => {
    cy.globalCrmSearch(client.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}/?`,
      trigger: () => cy.goToRelationView('Historial', element),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.get('body').click({ force: true });
    cy.interceptCrmRequest<ElementRegistries>({
      path: `element_registries/seguimientos?`,
      trigger: () => cy.findByTestId('preview-drawer-button').first().click(),
      callback: (body, status) => {
        expect(status).eq(200);
      },
    });
    cy.deleteTracking();
  });

  it('should delete test ticket', () => {
    cy.globalCrmSearch(client.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}/?`,
      trigger: () => cy.goToRelationView('Historial', element),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.globalCrmSearch(ticket.subject, element);
    cy.deleteTask(!!ticket.subject);
  });

  it('should delete test client', () => {
    cy.globalCrmSearch(client.nombre, relatedElement);
    cy.deleteRegister();
  });
});
