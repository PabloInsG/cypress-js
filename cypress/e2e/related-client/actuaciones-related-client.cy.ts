/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test tasks actions at related view', () => {
  let user;
  let client: NewClient;
  let task: NewTask;
  const relatedElement = 'clientes_propios';
  const element = 'actuaciones';
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('userCRM').then(data => {
      user = data;
    });
    cy.fixture('new_client').then(data => {
      client = data;
    });
    cy.fixture('new_task').then(data => {
      task = data;
    });
  });

  beforeEach(() => {
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: 'menus/me',
      trigger: () => cy.enterOfficeAndLogin(office, user.userName, user.userPassword),
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

  it('should create a new test client', () => {
    cy.quickCreateRegister(client, relatedElement);
  });

  it(`test create task from modal`, () => {
    cy.globalCrmSearch(client.nombre, relatedElement);
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
      trigger: () => cy.goToDetailView('Historial'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.createTask(task);
  });

  it(`test search tasks from global quick search`, () => {
    cy.globalCrmSearch(client.nombre, relatedElement);
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
      trigger: () => cy.goToDetailView('Historial'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.get('#ep-main-table').contains(task.subject);
  });

  it(`test edit task from preview drawer`, () => {
    cy.allFiltersSearch(client.nombre, relatedElement, 'Cliente');
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
      trigger: () => cy.goToDetailView('Historial'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.updateTask(task);
  });

  it(`test delete task`, () => {
    cy.allFiltersSearch(client.nombre, relatedElement, 'Cliente');
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
      trigger: () => cy.goToDetailView('Historial'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.deleteTask();
  });

  it('should delete test client', () => {
    cy.allFiltersSearch(client.nombre, relatedElement, 'Cliente');
    cy.deleteRegister();
  });
});
