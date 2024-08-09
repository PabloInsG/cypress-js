/// <reference types="cypress" />

import { getValueForNumberSeparator } from 'cypress/lib/utils';

describe('Test person config', () => {
  let office = Cypress.env('despacho');
  let users: UserCredentialOptions;
  let oldData: PersonalConfigResponse;
  let labelMap: labelMapConfigPersonal;
  let valueMap: valueMapConfigPersonal;
  let newData: labelMapConfigPersonal;

  before(() => {
    cy.fixture('users').then(data => (users = data));
    cy.fixture('labelMap_config-personal').then(data => (labelMap = data));
    cy.fixture('valueMap_config-personal').then(data => (valueMap = data));
    cy.fixture('new_config-personal').then(data => (newData = data));
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
  });

  it.skip('should change the data and save it', () => {
    cy.interceptCrmRequest<PersonalConfigResponse>({
      path: 'personal_config/me',
      trigger: () => cy.clickOnUserSettings('userMenu_settings'),
      callback: (body, status) => {
        expect(status).equal(200);
        oldData = body;
        cy.get('#tab-personalConfig')
          .should('not.have.class', 'is-disabled')
          .and('be.visible')
          .click();
        Object.keys(labelMap).forEach(label => {
          if(label === 'Cuenta de correo por defecto') return;
          if(label === 'Plantilla predefinida') {
            cy.get('.option-field').find('.el-button').contains(/seleccionar plantilla/i).click();
            cy.get('.el-drawer__body').contains(newData[label]).should('be.visible').click();
            cy.get('.el-input__inner[prop="template"]').invoke('val').then(value => {
              expect(value).equal(newData[label]);
            });
            return
          }
          cy.contains(label).click();
          if(label === 'Coste hora') {
            cy.get('.el-input__inner[prop="hourlyCost"]').then( $input => {
              cy.wrap($input).clear().type(newData[label]);
            });
            return;
          }
          cy.contains(label).next().find('.el-select').click();
          cy.get('.el-select__popper[aria-hidden="false"]').find('.el-select-dropdown__item').contains(newData[label]).click()
          cy.wait(100)
        })
      },
    });
    cy.interceptCrmRequest({
        method: "PUT",
        path: 'personal_config',
        trigger: () => cy.get('#save-btn').click(),
        callback: (body, status) => {
            expect(status).equal(200, 'The request was success');
            cy.get('.el-notification').should('be.visible').then( $notificationBox => {
                cy.wrap($notificationBox).find('.el-notification--success').should('exist');
                cy.wrap($notificationBox).contains('Configuración personal guardada correctamente').should('be.visible');
            });
        }
    })
  });

  it.skip('should render the data saved', () => {
    cy.interceptCrmRequest<PersonalConfigResponse>({
      path: 'personal_config/me',
      trigger: () => cy.clickOnUserSettings('userMenu_settings'),
      callback: (body, status) => {
        expect(status).equal(200);
        cy.get('#tab-personalConfig')
        .should('not.have.class', 'is-disabled')
        .and('be.visible')
        .click();
        Object.keys(labelMap).forEach(label => {
          if(label == 'Cuenta de correo por defecto') return;
          if (label === 'Plantilla predefinida') {
            cy.contains(label).next().find('.el-input__inner[prop="template"]').invoke('val').then(val => {
              expect(val).equal(newData[label]);
            });
            return;
          }
          cy.contains(label).next().should('contain', newData[label]);
        });
      }
    });
  });

  it.skip('should restart the old data', () => {
    cy.interceptCrmRequest<PersonalConfigResponse>({
      path: 'personal_config/me',
      trigger: () => cy.clickOnUserSettings('userMenu_settings'),
      callback: (body, status) => {
        expect(status).equal(200);
        cy.get('#tab-personalConfig')
        .should('not.have.class', 'is-disabled')
        .and('be.visible')
        .click();
        Object.keys(labelMap).forEach(label => {
          if(label == 'Cuenta de correo por defecto') return;
          cy.contains(label).click();
          if(label == 'Separador de miles y decimales') {
            const thousandsSeparator = oldData.thousandsSeparator;
            const decimalSeparator = oldData.decimalSeparator;
            const valueForNumberSeparator = getValueForNumberSeparator(
              thousandsSeparator,
              decimalSeparator,
            );
            const labelOption = valueMap.numberSeparator.find(
              option => option.value == valueForNumberSeparator,
            );
            cy.contains(label).next().find('.el-select').click();
            cy.get('.el-select__popper[aria-hidden="false"]').find('.el-select-dropdown__item').contains(labelOption!.label).click();
            return;
          };
          const key = labelMap[label];
          if(label == 'Coste hora') {
            cy.get('.el-input__inner[prop="hourlyCost"]').then($input => {
              cy.wrap($input).clear().type(oldData[key]);
            });
            return;
          }
          const apiResponse = oldData[key]
          const value = valueMap[key].find(item => item.value == apiResponse).label;
          if(label == 'Plantilla predefinida') {
            cy.get('.option-field').find('.el-button').contains(/seleccionar plantilla/i).click();
            cy.get('.el-drawer__body').contains(value).should('be.visible').click();
            cy.get('.el-input__inner[prop="template"]').invoke('val').then(val => {
              expect(val).equal(value);
            });
            return
          };
          cy.contains(label).next().find('.el-select').click();
          cy.get('.el-select__popper[aria-hidden="false"]').find('.el-select-dropdown__item').contains(value).click();
          cy.wait(100);
        });
      }
    });
    cy.interceptCrmRequest({
      method: 'PUT',
      path: 'personal_config',
      trigger: () => cy.get('#save-btn').click(),
      callback: (body, status) => {
        expect(status).equal(200, 'The request was success');
        cy.get('.el-notification')
          .should('be.visible')
          .then($notificationBox => {
            cy.wrap($notificationBox).find('.el-notification--success').should('exist');
            cy.wrap($notificationBox)
              .contains('Configuración personal guardada correctamente')
              .should('be.visible');
          });
      },
    });
  });
});
