/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test tickets actions at related view', () => {
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

  it.skip('should create a new test contacto met', () => {
    cy.quickCreateRegister(contact, relatedElement);
  });

  it.skip(`test create ticket from modal at related view`, () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}/?`,
      trigger: () => cy.goToRelationView('Historial', 'tickets'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.createTicket(ticket);
  });

  it.skip(`test search tickets from global quick search at related view`, () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}/?`,
      trigger: () => cy.goToRelationView('Historial', 'tickets'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.globalCrmSearch(ticket.subject, element);
    cy.findAllByTestId('main-table').contains(ticket.subject);
  });

  it.skip(`test edit ticket from preview drawer at related view`, () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}/?`,
      trigger: () => cy.goToRelationView('Historial', 'tickets'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.globalCrmSearch(ticket.subject, element);
    cy.updateTicket(ticket);
  });

  it.skip(`test delete ticket at related view`, () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}/?`,
      trigger: () => cy.goToRelationView('Historial', 'tickets'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.globalCrmSearch(ticket.subject, element);
    cy.deleteTicket(ticket.subject);
  });

  it.skip('should delete test client', () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.deleteRegister();
  });
});
