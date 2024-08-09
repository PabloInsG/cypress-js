/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('test tasks actions', () => {
  let users;
  let task: NewTask;
  const element = 'actuaciones';
  const office = Cypress.env('despacho');
  const actuacionesLabel = Cypress.env('actuacionesLabel') || 'Actuaciones';

  before(() => {
    cy.fixture('userCRM').then(data => {
      users = data;
    });
    cy.fixture('new_task').then(data => {
      task = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.userName, users.userPassword);
    cy.clickOnModuleElement('Gestión', actuacionesLabel);
  });

  it('test create task from modal', () => {
    cy.createTask(task);
  });

  it('should upload an existing file', () => {
    cy.findAllByTestId('preview-drawer-button').first().click(); //Selecting a taxe to edit

    //Upload an existing file
    cy.findAllByTestId('dropdown-upload-button').eq(1).click({ force: true });
    cy.contains('Selecciona existente').click();
    cy.get('.document').first().click('left'); //Existing file

    //Checking out if the file was upload
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      method: 'POST',
      path: `relation_element/gdocu`,
      trigger: () => cy.findAllByTestId('submit-task-form-drawer').eq(1).click({ force: true }), //There are 2 buttons like this... (?)
      callback: (body, status) => {
        expect(status).to.eq(201);
      },
    });
  });

  it('test search tasks from all filters drawer', () => {
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.get('#ep-main-table').contains(task.subject);
  });

  it('test edit task from preview drawer', () => {
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.updateTask(task);
  });

  it('test delete task', () => {
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.deleteTask();
  });
});
