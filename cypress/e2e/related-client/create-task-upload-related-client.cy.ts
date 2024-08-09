/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test crate task and upload files from a related client', () => {
  let user;
  let client: NewClient;
  let task: NewTask;
  const relatedElement = 'clientes_propios';
  const element = 'actuaciones';
  const fileName1 = 'Example1.pdf';
  const fileName2 = 'Example2.pdf';
  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('userCRM').then(data => {
      user = data;
    });
    cy.fixture('new_task').then(data => {
      task = data;
    });
    cy.fixture('new_client').then(data => {
      client = data;
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

  it(`test create task from modal from a client and upload a new file`, () => {
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.get('body').click({ force: true });
    cy.findByTestId('create-task-button').click('center', { force: true });
    cy.findByTestId('create-task-button').click('center', { force: true });
    cy.findByTestId('input-subject').last().click().type(task.subject);
    cy.get('#select-task-priority').click({ force: true });
    cy.findByTestId('option-Alta').click({ force: true });
    cy.get('#select-task-state').click({ force: true });
    cy.findByTestId('option-Planificado').click({ force: true });
    cy.findByTestId('dropdown-upload-button').click();
    cy.get('ul.el-dropdown-menu:visible');
    cy.get('input.el-upload__input').selectFile(`cypress/fixtures/${fileName1}`, { force: true });
    cy.interceptDocManagerRequest<UpLoadFileTaskResponse>({
      method: 'POST',
      path: 'files/uploaded-file',
      trigger: () => cy.findByTestId('submit-task-form-modal').click({ force: true }),
      callback: (body, status) => {
        expect(status).to.eq(201);
      },
    });
  });

  it(`test created task from a client has file at its doc-manager`, () => {
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.get('#ep-main-table').contains(task.subject);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_registries/${element}/?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').first().click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ListFolder[]>({
      path: 'element_registries/gdocu?',
      trigger: () => cy.goToRelationView('Historial', 'gdocu').click(),
      callback: (body, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(2000);
    cy.get('#documents-table').contains(fileName1);
  });

  it(`test upload a second file from doc-manager of the client`, () => {
    cy.allFiltersSearch(client.nombre, relatedElement, 'Cliente');
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ListFolder[]>({
      path: 'element_registries/gdocu?',
      trigger: () => cy.goToRelationView('Historial', 'gdocu').click(),
      callback: (body, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.get('input.el-upload__input').selectFile(`cypress/fixtures/${fileName2}`, { force: true });
    cy.wait(200);
    cy.get('.el-message-box__input').should('be.visible').find('input').clear().type(fileName2);
    cy.interceptDocManagerRequest<UpLoadFileTaskResponse>({
      method: 'POST',
      path: 'files/uploaded-file',
      trigger: () =>
        cy
          .get('.el-message-box__btns')
          .contains(/confirmar/i)
          .click({ force: true }),
      callback: (body, status) => {
        expect(status).to.equal(201);
        cy.findByTestId('dialog-upload-alert')
          .should('be.visible')
          .then($alert => {
            cy.wrap($alert).should('not.be.visible');
          });
        cy.findByTestId('table-list-gdocu')
          .find('.document-name')
          .contains(`${fileName2}`)
          .should('be.visible');
      },
    });
  });

  it(`test create task from modal and relate an existing file`, () => {
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.get('body').click({ force: true });
    cy.findByTestId('create-task-button').click('center', { force: true });
    cy.findByTestId('create-task-button').click('center', { force: true });
    cy.findByTestId('input-subject').last().click().type(task.subject);
    cy.get('#select-task-priority').click({ force: true });
    cy.findByTestId('option-Alta').click({ force: true });
    cy.get('#select-task-state').click({ force: true });
    cy.findByTestId('option-Planificado').click({ force: true });
    cy.findByTestId('dropdown-upload-button').click();
    cy.get('ul.el-dropdown-menu:visible')
      .findByTestId('dropdown_option__Selecciona existente')
      .click();
    cy.get('.el-drawer__body').contains(fileName2).dblclick();
    cy.get('.el-overlay:visible').first().click();
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      method: 'POST',
      path: `element_register/${element}/?`,
      trigger: () => cy.findByTestId('submit-task-form-modal').click({ force: true }),
      callback: (body, status) => {
        expect(status).to.eq(201);
      },
    });
  });

  it(`test created task has boths files at its doc-manager `, () => {
    cy.allFiltersSearch(client.nombre, relatedElement, 'Cliente');
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: `element_register/${relatedElement}/?`,
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(3000);
    cy.interceptCrmRequest<ListFolder[]>({
      path: 'element_registries/gdocu?',
      trigger: () => cy.goToRelationView('Historial', 'gdocu').click(),
      callback: (body, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.get('body').click({ force: true });
    cy.wait(2000);
    cy.get('#documents-table').contains(fileName1);
    cy.get('#documents-table').contains(fileName2);
    cy.findByTestId('globalQuickSearch').clear().type('Example');
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      method: 'GET',
      path: `element_registries/gdocu?`,
      trigger: () => cy.findByTestId('globalQuickSearchPrepend').click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(500);
    cy.findByTestId('table-list-gdocu').find('.el-checkbox').eq(0).click();
    cy.findByTestId('table-list-gdocu').find('.el-checkbox').eq(1).click();
    cy.get('button').contains('Borrar').click({ force: true });
    cy.get(`input[placeholder=2]:visible`).type(String(2));
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      method: 'DELETE',
      path: 'element_register/mass/gdocu?',
      trigger: () => cy.get('.el-dialog').find('button:visible').eq(1).click(),
      callback: (body, status) => {
        expect(status).to.eq(202);
      },
    });
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
      trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
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
