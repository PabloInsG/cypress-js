/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test tasks actions at related view', () => {
  let user;
  let contact: NewMetContact;
  let task: NewTask;
  const relatedElement = 'contactos_met';
  const element = 'actuaciones';
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('userCRM').then(data => {
      user = data;
    });
    cy.fixture('new_contact_met').then(data => {
      contact = data;
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
      trigger: () => cy.clickOnModuleElement('Ficheros', 'Contactos principales'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });

  it('should create a new test contact', () => {
    cy.quickCreateRegister(contact, relatedElement);
  });

  it(`test create task from modal`, () => {
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.createTask(task);
  });

  it(`test search tasks from global quick search`, () => {
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });

    cy.get('[data-testid=allFiltersButton]').click();

    //Aside div
    cy.get('.el-drawer__body')
      .should('be.visible')
      .within(() => {
        cy.contains('.el-button--default', 'Asunto').click();

        cy.get('.w-100 div')
          .eq(0)
          .click({ force: true })
          .within(() => {
            cy.get('input').type(task.subject, { force: true });
            cy.contains('li', task.subject).click({ force: true });
            cy.findByTestId('filterButton').click({ force: true });
          });

        //Filtering
        cy.contains('.el-button', 'Filtrar').click();

        cy.wait(2000);
      });

    cy.get('#ep-main-table').contains(task.subject);
  });

  it(`test edit task from preview drawer`, () => {
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });

    cy.get('[data-testid=allFiltersButton]').click();

    //Aside div
    cy.get('.el-drawer__body')
      .should('be.visible')
      .within(() => {
        cy.contains('.el-button--default', 'Asunto').click();

        cy.get('.w-100 div')
          .eq(0)
          .click({ force: true })
          .within(() => {
            cy.get('input').type(task.subject, { force: true });
            cy.contains('li', task.subject).click({ force: true });
            cy.findByTestId('filterButton').click({ force: true });
          });

        //Filtering
        cy.contains('.el-button', 'Filtrar').click();

        cy.wait(2000);
      });

    cy.updateTask(task);
  });

  it(`test delete task`, () => {
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });

    cy.get('[data-testid=allFiltersButton]').click();

    //Aside div
    cy.get('.el-drawer__body')
      .should('be.visible')
      .within(() => {
        cy.contains('.el-button--default', 'Asunto').click();

        cy.get('.w-100 div')
          .eq(0)
          .click({ force: true })
          .within(() => {
            cy.get('input').type(task.subject, { force: true });
            cy.contains('li', task.subject).click({ force: true });
            cy.findByTestId('filterButton').click({ force: true });
          });

        //Filtering
        cy.contains('.el-button', 'Filtrar').click();

        cy.wait(2000);
      });

    cy.deleteTask();
  });

  it('should delete test contact', () => {
    cy.globalCrmSearch(contact.nombre, relatedElement);
    cy.deleteRegister();
  });
});
