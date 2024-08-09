/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test tickets actions at related view', () => {
  let users: UserCredentialOptions;
  let ticket: NewTicket;

  const element = 'tickets';
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
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
      path: 'element_registries/clientes_propios?',
      trigger: () => cy.clickOnModuleElement('Ficheros', 'Cliente'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'element_register/clientes_propios/?',
      trigger: () => cy.findByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'element_registries/tickets/?',
      trigger: () => cy.goToRelationView('Historial', 'tickets'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });

  it(`test create ticket from modal at related view`, () => {
    cy.createTicket(ticket);
  });

  it(`test search tickets from global quick search at related view`, () => {
    cy.globalCrmSearch(ticket.subject, element);
    cy.findByTestId('main-table').contains(ticket.subject);
  });

  it(`test edit ticket from preview drawer at related view`, () => {
    cy.globalCrmSearch(ticket.subject, element);
    cy.updateTicket(ticket);
  });

  it(`test delete ticket at related view`, () => {
    cy.deleteTicket(ticket.subject);
  });
});
