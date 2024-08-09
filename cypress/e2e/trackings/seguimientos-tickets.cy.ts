/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test trackings actions from ticket drawer', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  let ticket: NewTicket;
  const element = 'tickets';

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
  it('should create a new test ticket', () => {
    cy.createTicket(ticket);
  });
  it('should verify that can create new tracking', () => {
    cy.globalCrmSearch(ticket.subject, element);
    cy.interceptCrmRequest<ElementRegistries>({
      path: `element_registries/seguimientos?`,
      trigger: () => cy.findAllByTestId('preview-drawer-button').first().click(),
      callback: (body, status) => {
        expect(status).eq(200);
      },
    });
    cy.createTracking();
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: 'element_registries/seguimientos?',
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });

  it('should verify that can edit a tracking', () => {
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

  it('should verify that can delete a tracking', () => {
    cy.globalCrmSearch(ticket.subject, element);
    cy.interceptCrmRequest<ElementRegistries>({
      path: `element_registries/seguimientos?`,
      trigger: () => cy.findAllByTestId('preview-drawer-button').first().click(),
      callback: (body, status) => {
        expect(status).eq(200);
      },
    });
    cy.deleteTracking();
  });

  it('should delete created test ticket', () => {
    cy.globalCrmSearch(ticket.subject, element);
    cy.deleteTicket(ticket.subject);
  });
});
