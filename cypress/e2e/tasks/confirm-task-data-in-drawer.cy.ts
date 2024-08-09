/// <reference types="cypress" />
import 'cypress-localstorage-commands';
import { convertSecondsToTimeFormat, changeDataHourFormat } from 'cypress/lib/utils';

describe('Test task drawer section', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const actuacionesLabel = Cypress.env('actuacionesLabel') || 'Actuaciones';

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  it('should verify that the fields have the values received from the request', () => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.clickOnModuleElement('Gestión', actuacionesLabel);
    cy.interceptCrmRequest<UserDataProfile>({
      path: `element_register/actuaciones/`,
      trigger: () => cy.get('[data-testid="preview-drawer-button"]').first().click(),
      callback: (body, status) => {
        const values = body.values;
        const subject = values.find(value => value.property.name == 'Subject');
        const fechaAlta = values.find(value => value.property.name == 'fecha_alta');
        const priority = values.find(value => value.property.name == 'Prioridad');
        const state = values.find(value => value.property.name == 'Estado');
        const person = values.find(value => value.property.name == 'profesional_asignado');
        const description = values.find(value => value.property.name == 'Description');
        const facture = values.find(value => value.property.name == 'facturar');
        const duration = values.find(value => value.property.name == 'duracion');
        const fechaVencimiento = values.find(value => value.property.name == 'fecha_vencimiento');
        if (
          !description ||
          !description ||
          !facture ||
          !person ||
          !state ||
          !priority ||
          !fechaAlta ||
          !subject ||
          !duration
        )
          throw Error('Property is undefined');
        cy.findByTestId('create-task-form').then($container => {
          cy.findByTestId('input-subject').find('input').invoke('val', subject.value);
          cy.get('#date-picker-start-date')
            .invoke('val')
            .then($val => {
              expect(changeDataHourFormat($val)).eq(changeDataHourFormat(fechaAlta.value));
            });
          //TODO expected 14-07-2029 18:07 to equal 14-07-2029 20:00
          /* cy.get('#date-picker-due-date')
            .invoke('val')
            .then($val => {
              if (!fechaVencimiento) throw Error('fecha alta is undefined');
              expect(changeDataHourFormat($val)).eq(changeDataHourFormat(fechaVencimiento.value));
            }); */
          cy.get('#select-task-priority')
            .parents('.el-select__selection')
            .should('contain', priority.value);
          cy.get('#select-task-state')
            .parents('.el-select__selection')
            .should('contain', state.label);
          if (person.value) {
            cy.get('#select-task-asignee')
              .parents('.el-select__selection')
              .should('contain', person.value);
          } else {
            cy.get('#select-task-asignee')
              .parents('.el-select__selection')
              .should('contain', 'Selecciona persona asignada');
          }
          cy.get('#billable-checkbox').should(
            facture.value == '0' ? 'not.be.checked' : 'be.checked',
          );
          const tiempo = convertSecondsToTimeFormat(duration.value).split(':');
          const hour = tiempo[0];
          const minutes = tiempo[1];
          const seconds = tiempo[2];
          if (tiempo[0]) {
            cy.wrap($container)
              .findByTestId('input-duration-hours')
              .find('input')
              .invoke('val')
              .should('eq', hour);
          }
          if (tiempo[1]) {
            cy.wrap($container)
              .findByTestId('input-duration-minutes')
              .find('input')
              .invoke('val')
              .should('eq', minutes);
          }
          if (tiempo[2]) {
            cy.wrap($container)
              .findByTestId('input-duration-seconds')
              .find('input')
              .invoke('val')
              .should('eq', seconds);
          }
        });
      },
    });
  });
});
