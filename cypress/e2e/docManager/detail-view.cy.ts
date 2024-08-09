/// <reference types="cypress" />

import 'cypress-localstorage-commands';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';

const generatorConfig = {
  dictionaries: [adjectives, colors, animals],
};

describe('Document manager', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  let newIdFolder;
  let generalFolders;
  let files: string[] = [];

  for (let x = 0; x < 1; x++) {
    files.push('cypress/results/test-upload-gdocu.xml');
  }

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.interceptDocManagerRequest<any[]>({
      path: 'folders/1?',
      trigger: () => cy.goToDocManager(office),
      callback: body => {
        generalFolders = body;
      },
    });
    cy.findByTestId('colapse-button-metadata').click();
    cy.findByTestId('folder-view').should('be.visible');
  });

  it('Should test that metadata panel works and update changes', () => {
    cy.getFirstOfDocsList().find('.el-checkbox').click();
    cy.findByTestId('details-one-select').should('be.visible');
    cy.findByTestId('table-list-gdocu');
    let originalName;
    const newName = uniqueNamesGenerator(generatorConfig);
    let originalDescription;
    const newDescription = uniqueNamesGenerator(generatorConfig);
    cy.getEditableInputByLabel('Nombre').click();
    cy.getEditableInputByProp('name').then(el => {
      originalName = el[0].value;
      cy.getEditableInputByProp('name').clear().type(newName);
      cy.getEditableInputByLabel('Descripción').click();
      cy.getEditableInputByProp('description').then(el => {
        originalDescription = el[0].value;
        cy.getEditableInputByProp('description').clear().type(newDescription);
        cy.findByTestId('details-confirm-button').click();
        cy.findByTestId('check-main-list-' + newName).click();

        // Check the new values
        cy.get('.ep-editable-input-field').contains(newName);
        cy.get('.ep-editable-input-field').contains(newDescription);

        // take back the original values
        cy.getEditableInputByLabel('Nombre').click();
        cy.getEditableInputByProp('name').clear().type(originalName);
        cy.getEditableInputByLabel('Descripción').click();
        if (originalDescription) {
          cy.getEditableInputByProp('description').clear().type(originalDescription);
        } else {
          cy.getEditableInputByProp('description').clear();
        }
        cy.findByTestId('details-confirm-button').click();

        cy.findByTestId('check-main-list-' + originalName).click();

        // 3. Multiple documents/folders are selected, so grouped metadata should be there
        cy.get('.el-table-v2__header-row').find('.el-checkbox').first().click();
        cy.findByTestId('multiple-document-view').should('be.visible');
        cy.get('.el-table-v2__header-row').find('.el-checkbox').first().click();
      });
    });
  });
  it('Should test the tags on metadata panel', () => {
    // todo no se ve el select de tags, no llega en la vista?
    /*cy.getFirstOfDocsList().find('.el-checkbox').click();

    cy.findByTestId('details-one-select').should('be.visible');
    cy.intercept('GET', 'https://api-crm.dev.iberley.net/api/element_register/gdocu/!**').as(
      'getUpdateFile',
    );
    cy.get('.el-select:visible').click();
    cy.wait(1000);
    cy.get('.el-tag').contains('New tag gdocu').click();
    cy.getFirstOfDocsList().find('.el-checkbox').click();
    cy.getFirstOfDocsList().find('.el-checkbox').click();
    cy.intercept('GET', 'https://api-crm.dev.iberley.net/api/element_register/gdocu/!**').as(
      'getUpdateFile2',
    );

    cy.wait('@getUpdateFile2');
    cy.get('.el-tag').first().as('tag').should('contain', 'New tag gdocu').find('.el-icon').click();
    cy.getFirstOfDocsList().find('.el-checkbox').click();
    cy.getFirstOfDocsList().find('.el-checkbox').click();
    cy.intercept('GET', 'https://api-crm.dev.iberley.net/api/element_register/gdocu/!**').as(
      'getUpdateFile3',
    );
    cy.wait('@getUpdateFile3');
    cy.get('@tag').should('not.be.visible');*/
  });
  it('Should test the relations on metadata panel', () => {
    //TODO
  });
  it('Should test the permisions on metadata panel', () => {
    cy.getFirstOfDocsList().find('.el-checkbox').click();
    cy.findByTestId('details-one-select').should('be.visible');
    cy.get('.el-collapse').contains('Permisos').click({ force: true });
    cy.get('.el-collapse-item:visible').last().find('.el-select').last().click({ force: true });
    cy.wait(1000);
    cy.get('.el-tag').contains('root').click({ force: true });
    cy.getFirstOfDocsList().find('.el-checkbox').click({ force: true });
    cy.getFirstOfDocsList().find('.el-checkbox').click({ force: true });
    // todo algo más que probar aquí?
    /*cy.interceptCrmRequest({
      path: 'element_register/gdocu/(.+)',
      callback: () => {
        cy.get('.el-collapse').contains('Permisos').click();
        cy.get('.root')
          // cy.get('.el-tag')
          //   .contains('root')
          .as('tag')
          //   .should('contain', 'root')
          .find('.el-icon')
          .click();
        cy.getFirstOfDocsList().find('.el-checkbox').click({ force: true });
        cy.getFirstOfDocsList().find('.el-checkbox').click({ force: true });
        cy.interceptCrmRequest({
          path: 'element_register/gdocu/(.+)',
          callback: () => {
            cy.get('@tag').should('not.be.visible');
          },
        });
      },
    });*/
  });
});
