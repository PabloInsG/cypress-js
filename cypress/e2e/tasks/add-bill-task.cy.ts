/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('test tasks actions', () => {
  let users;
  let task: NewTask;
  const element = 'actuaciones';
  const office = Cypress.env('despacho');
  const actuacionesLabel = Cypress.env('actuacionesLabel') || 'Actuaciones';
  const isBill = true;

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

  it('should create a billable task', () => {
    cy.createTask(task, false, isBill);
  });

  it('should delete the billable task', () => {
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.deleteTask();
  });
});
