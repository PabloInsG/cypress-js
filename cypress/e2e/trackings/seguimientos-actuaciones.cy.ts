/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('Test task drawer section', () => {
  let users: UserCredentialOptions;
  let task: NewTask;
  const element = 'actuaciones';
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
    cy.fixture('new_task').then(data => {
      task = data;
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
      path: `element_registries/${element}?`,
      trigger: () => cy.clickOnModuleElement('Gestión', 'Actuaciones'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });

  it.skip('should create a new test task', () => {
    cy.createTask(task);
  });

  it.skip('should verify that can create new tracking', () => {
    cy.globalCrmSearch(task.subject, element);
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

  it.skip('should verify that can edit a tracking', () => {
    cy.globalCrmSearch(task.subject, element);
    cy.interceptCrmRequest<ElementRegistries>({
      path: `element_registries/seguimientos?`,
      trigger: () => cy.findAllByTestId('preview-drawer-button').first().click(),
      callback: (body, status) => {
        expect(status).eq(200);
      },
    });
    cy.updateTrackingFromTasks();
  });

  it.skip('should verify that can delete a tracking', () => {
    cy.globalCrmSearch(task.subject, element);
    cy.interceptCrmRequest<ElementRegistries>({
      path: `element_registries/seguimientos?`,
      trigger: () => cy.findAllByTestId('preview-drawer-button').first().click(),
      callback: (body, status) => {
        expect(status).eq(200);
      },
    });
    cy.deleteTracking();
  });

  it.skip('should delete test task', () => {
    cy.globalCrmSearch(task.subject, element);
    cy.deleteTask();
  });
});
