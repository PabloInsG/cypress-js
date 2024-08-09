/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('test tasks actions', () => {
  let users: UserCredentialOptions;
  let task: NewTask;
  const element = 'actuaciones';
  const office = Cypress.env('despacho');
  const actuacionesLabel = Cypress.env('actuacionesLabel') || 'Actuaciones';
  const isEvent = true;

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
    cy.fixture('new_task').then(data => {
      task = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnModuleElement('Gestión', actuacionesLabel);
  });

  it('should create a task with event', () => {
    cy.createTask(task, isEvent);
  });

  it('shoul delete the task with event created', () => {
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.deleteTask(isEvent);
  });
});
