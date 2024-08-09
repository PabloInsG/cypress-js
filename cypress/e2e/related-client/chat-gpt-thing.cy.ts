/// <reference types="cypress" />
import 'cypress-localstorage-commands';
describe('Test for mass actions on tasks', () => {
  let user;
  let client: NewClient;
  let task: NewTask;
  const relatedElement = 'clientes_propios';
  const element = 'actuaciones';
  const office = Cypress.env('despacho');
  const predefined1 = 'predefined' + new Date().getTime();
  const predefined2 = 'predefined' + (new Date().getTime() + 1);
  const loginAndNavigate = () => {
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
  };
  const searchClientAndIntercept = () => {
    cy.globalCrmSearch(client.nombre, relatedElement);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  };
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
    loginAndNavigate();
    // Navigate to predefined tasks and create new ones
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'predefined?',
      trigger: () => cy.findByTestId('predefinedTasksButton').click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.GEN_predefined_actuacion(predefined1);
    cy.GEN_predefined_actuacion(predefined2);
  });
  beforeEach(() => {
    loginAndNavigate();
  });
  it('should create a new test client', () => {
    cy.quickCreateRegister(client, relatedElement);
  });
  it('should create a task from modal', () => {
    searchClientAndIntercept();
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
  it('should search tasks from global quick search', () => {
    searchClientAndIntercept();
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
  it('should edit task from preview drawer', () => {
    searchClientAndIntercept();
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
  it('should globally search and edit the new predefined tasks', () => {
    cy.contains(".el-sub-menu__title", "Gestión").click({ force: true });
    cy.interceptCrmRequest({
      method: "GET",
      path: `view`,
      trigger: () => cy.contains('.el-menu-item', 'Tareas predefinidas').click({ force: true }),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    const editPredefinedTask = (taskName) => {
      cy.interceptCrmRequest({
        method: "GET",
        path: "predefined",
        trigger: () => cy.findByTestId("globalQuickSearch").click({ force: true }).clear().type(taskName + '{enter}'),
        callback(body, status) {
          expect(status).eq(200);
        },
      });
      cy.findByTestId("openPreviewDrawerButton").click();
      cy.contains(".el-select__selected-item", "Hecho").click();
      cy.findByTestId('option-Planificado').click();
      cy.interceptCrmRequest({
        method: "PUT",
        path: "predefined/actuaciones",
        trigger: () => cy.findByTestId("createUpdateButton").click(),
        callback(body, status) {
          expect(status).eq(200);
        },
      });
    };
    editPredefinedTask(predefined1);
    editPredefinedTask(predefined2);
  });
  it.skip('should upload more than one predefined task for a client', () => {
    searchClientAndIntercept();
    cy.interceptCrmRequest({
      path: `element_registries/${element}/?`,
      trigger: () => cy.goToRelationView('Historial', "actuaciones"),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.findAllByTestId("export-view-button").first().click({ force: true });
    cy.get(".el-dialog").should("be.visible");
    cy.wait(1000);
    cy.contains("div", predefined1).find("input[type=checkbox]").click({ force: true });
    cy.contains("div", predefined2).find("input[type=checkbox]").click({ force: true });
    cy.interceptCrmRequest({
      method: "GET",
      path: "predefined",
      trigger: () => cy.findByTestId("config-save-button").click(),
      callback(body, status) {
        expect(status).eq(201);
      },
    });
    [predefined1, predefined2].forEach(subject => {
      cy.globalCrmSearch(subject, element);
      cy.get(".el-table__body tbody tr").should("exist");
      cy.deleteTask();
    });
  });
  it('should delete the predefined tasks', () => {
    cy.contains(".el-sub-menu__title", "Gestión").click({ force: true });
    cy.interceptCrmRequest({
      method: "GET",
      path: `view`,
      trigger: () => cy.contains('.el-menu-item', 'Tareas predefinidas').click({ force: true }),
      callback: (response, status) => {
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
  it('should delete the test client', () => {
    cy.globalCrmSearch(client.nombre, relatedElement);
    cy.deleteRegister();
  });
});