/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test tickets actions', () => {
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
      path: 'element_registries/tickets?',
      trigger: () => cy.clickOnModuleElement('Gestión', 'Tickets'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });

  it(`test create ticket from modal`, () => {
    cy.createTicket(ticket);
  });

  it(`test search tickets from global search`, () => {
    cy.globalCrmSearch(ticket.subject, element);
    cy.findByTestId('main-table').contains(ticket.subject);
  });

  it(`test edit ticket from preview drawer`, () => {
    cy.globalCrmSearch(ticket.subject, element);
    cy.updateTicket(ticket);
  });

  it(`test delete ticket`, () => {
    cy.globalCrmSearch(ticket.subject, element);
    cy.deleteTicket(ticket.subject);
  });
});
