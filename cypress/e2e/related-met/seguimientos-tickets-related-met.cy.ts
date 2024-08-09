/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test create, edit and delete trackings inside a contact ', () => {
  let users: UserCredentialOptions;
  let contact: NewMetContact;
  let ticket: NewTicket;
  const relatedElement = 'contactos_met';
  const element = 'tickets';
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
    cy.fixture('new_contact_met').then(data => {
      contact = data;
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
      trigger: () => cy.clickOnModuleElement('Ficheros', 'Contactos principales'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });

  // TODO: arreglar el buscador global
  it.skip('should create a new contact and a new test ticket', () => {
    cy.quickCreateRegister(contact, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}?`,
      trigger: () => cy.goToRelationView('Historial', element),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.createTicket(ticket);
  });

  it.skip('should verify that can create new tracking', () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}?`,
      trigger: () => cy.goToRelationView('Historial', element),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.globalCrmSearch(ticket.subject, element);
    cy.get('body').click({ force: true });
    cy.interceptCrmRequest<ElementRegistries>({
      path: `element_registries/seguimientos?`,
      trigger: () => cy.findAllByTestId('preview-drawer-button').first().click(),
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

  it.skip('should verify that can edit a tracking', () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}?`,
      trigger: () => cy.goToRelationView('Historial', element),
      callback: (response, status) => {
        expect(status).to.eq(200);
        console.log(response);
      },
    });
    cy.globalCrmSearch(ticket.subject, element);
    cy.interceptCrmRequest<ElementRegistries>({
      path: `element_registries/seguimientos?`,
      trigger: () => cy.findAllByTestId('preview-drawer-button').first().click(),
      callback: (body, status) => {
        expect(status).eq(200);
      },
    });
    cy.updateTrackingFromTickets();
  });

  it.skip('should verify that can delete a tracking', () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}?`,
      trigger: () => cy.goToRelationView('Historial', element),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.get('body').click({ force: true });
    cy.interceptCrmRequest<ElementRegistries>({
      path: `element_registries/seguimientos?`,
      trigger: () => cy.findAllByTestId('preview-drawer-button').first().click(),
      callback: (body, status) => {
        expect(status).eq(200);
      },
    });
    cy.deleteTracking();
  });

  it.skip('should delete test ticket', () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}?`,
      trigger: () => cy.goToRelationView('Historial', element),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.globalCrmSearch(ticket.subject, element);
    cy.deleteTask();
  });

  it.skip('should delete test client', () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.deleteRegister();
  });
});
