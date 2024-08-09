/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test for masive tasks actions', () => {
  let user;
  let client: NewClient;
  let task: NewTask;
  const relatedElement = 'clientes_propios';
  const element = 'actuaciones';
  const office = Cypress.env('despacho');

  const predefined1 = 'predefined' + new Date().getTime();
  const predefined2 = 'predefined' + (new Date().getTime() + 1);

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

    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: 'menus/me',
      trigger: () => cy.enterOfficeAndLogin(office, user.userName, user.userPassword),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });

    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: `element_registries/actuaciones`,
      trigger: () => cy.clickOnModuleElement('Gestión', 'Trabajos'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });

    //Go to predefined tasks
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'predefined?',
      trigger: () => cy.findByTestId('predefinedTasksButton').click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });

    //New predefined
    cy.GEN_predefined_actuacion(predefined1);
    cy.GEN_predefined_actuacion(predefined2);
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
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
      trigger: () => cy.findByTestId('rowDetailLink').eq(0).click(),
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
    cy.globalCrmSearch(task.subject, element);
    cy.get('#ep-main-table').contains(task.subject);
  });

  it(`test edit task from preview drawer`, () => {
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.globalCrmSearch(task.subject, element);
    cy.updateTask(task);
  });

  it("should global search and edit the new predefined", () => {
    cy.contains(".el-sub-menu__title", "Gestión").click({ force: true });

    cy.interceptCrmRequest({
      method: "GET",
      path: `view`,
      trigger: () => cy.contains('.el-menu-item', 'Tareas predefinidas').click({ force: true }),
      callback: (response, status) => {
        cy.wait(2000);
        expect(status).to.eq(200);
      },
    });

    cy.interceptCrmRequest(
      {
        method: "GET",
        path: "predefined",
        trigger: () => cy.findByTestId("globalQuickSearch").click({ force: true }).clear().type(predefined1 + '{enter}'),
        callback(body, status) {
          expect(status).eq(200);
        },
      }
    );

    //Edition. Only modify the predefined state
    cy.findByTestId("openPreviewDrawerButton").click();
    cy.contains(".el-select__selected-item", "Hecho").click();
    cy.findByTestId('option-Planificado').click();

    cy.interceptCrmRequest({
      method: "PUT",
      path: "predefined/actuaciones",
      trigger: () => cy.findByTestId("createUpdateButton").click(), //Save
      callback(body, status) {
        expect(status).eq(200);
      },
    });

    cy.interceptCrmRequest(
      {
        method: "GET",
        path: "predefined",
        trigger: () => cy.findByTestId("globalQuickSearch").clear().type(predefined2 + '{enter}'),
        callback(body, status) {
          expect(status).eq(200);
        },
      }
    );

    //Edition. Only modify the predefined state
    cy.findByTestId("openPreviewDrawerButton").click();
    cy.contains(".el-select__selected-item", "Hecho").click();
    cy.findByTestId('option-Planificado').click();

    cy.interceptCrmRequest({
      method: "PUT",
      path: "predefined/actuaciones",
      trigger: () => cy.findByTestId("createUpdateButton").click(), //Save
      callback(body, status) {
        expect(status).eq(200);
      },
    });

  });

  it(`should upload more than one predefined task for a client`, () => {

    //Search and take the test client
    cy.globalCrmSearch(client.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });

    //Waiting for 'Módulo actuaciones"
    cy.interceptCrmRequest({
      path: `element_registries/${element}/?`,
      trigger: () => cy.goToRelationView('Historial', "actuaciones"),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });

    //'Predefinidas' button
    cy.findAllByTestId("export-view-button").first().click({ force: true });
    cy.get(".el-dialog").should("be.visible");
    cy.wait(1000);

    //Get the predefined tasks
    cy.contains("div", predefined1).find("input[type=checkbox]").click({ force: true });
    cy.contains("div", predefined2).find("input[type=checkbox]").click({ force: true });


    //Verify if the relation between client and predefined task is created
    cy.interceptCrmRequest({
      method: "GET",
      path: "predefined",
      trigger: () => cy.findByTestId("config-save-button").click(),
      callback(body, status) {
        expect(status).eq(201);
      },
    });

    for (let i = 0; i < 2; i++) {
      let subject;
      if (i == 0) {
        subject = predefined1;
      } else {
        subject = predefined2;
      }
      //Global search
      cy.globalCrmSearch(subject, element);

      //Check if there is any register in the table
      cy.get(".el-table__body tbody tr").should("exist");

      //Delete predefined
      cy.deleteTask();
    }
  });

  it("should delete the predefined", () => {

    cy.contains(".el-sub-menu__title", "Gestión").click({ force: true });

    cy.interceptCrmRequest({
      method: "GET",
      path: `view`,
      trigger: () => cy.contains('.el-menu-item', 'Tareas predefinidas').click({ force: true }),
      callback: (response, status) => {
        cy.wait(2000);
        expect(status).to.eq(200);
      },
    });

    cy.contains("tbody tr", predefined1).find("input.el-checkbox__original").click({force: true});
    cy.contains("tbody tr", predefined2).find("input.el-checkbox__original").click({force: true});

    cy.get('button').contains('Borrar').click({ force: true });
    cy.get('input[placeholder=2]').type('2');

    cy.interceptCrmRequest({
      method: "DELETE",
      path: "predefined/actuaciones",
      trigger: () => cy.get('.el-dialog').find('button').eq(1).click(),
      callback(body, status) {
        expect(status).eq(200);
      },
    });
  });

  it(`test delete task`, () => {
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.globalCrmSearch(task.subject, element);
    cy.deleteTask();
  });

  it('should delete test client', () => {
    cy.globalCrmSearch(client.nombre, relatedElement);
    cy.deleteRegister();
  });
});
