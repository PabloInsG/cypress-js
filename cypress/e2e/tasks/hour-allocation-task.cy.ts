/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test tasks actions', () => {
  let users: UserCredentialOptions;
  let task: NewTask;
  const element = 'actuaciones';
  const taskName = 'Imputacion hora prueba Cypress - #id-212';
  const office = Cypress.env('despacho');
  const actuacionesLabel = Cypress.env('actuacionesLabel') || 'Actuaciones';

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
    cy.fixture('new_task').then(data => {
      task = data;
    });
  });

  it('should create a hour allocation', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.findByTestId('button-duration-start').click();
    cy.wait(2000);
    cy.findByTestId('button-duration-pause').click();
    cy.wait(2000);
    cy.findByTestId('button-duration-start').click();
    cy.wait(2000);
    cy.findByTestId('button-duration-stop').click();
    cy.get('.el-dialog.wrapper-modal-dialog')
      .should('exist')
      .then($el => {
        cy.findByTestId('input-subject').find('input').type(taskName);
        cy.wrap($el)
          .findByTestId('input-duration-seconds')
          .find('input')
          .invoke('val')
          .then(val => {
            expect(val).eq('4');
          });
      });
    cy.interceptCrmRequest({
      method: 'POST',
      path: 'element_register/actuaciones',
      trigger: () => cy.findByTestId('submit-task-form-modal').click(),
      callback: (body, status) => {
        expect(status).eq(201);
      },
    });
  });
  it('should delete the hour alocation created', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnModuleElement('Gestión', actuacionesLabel);
    cy.allFiltersSearch(taskName, element, 'Asunto');
    cy.deleteTask();
  });
});
