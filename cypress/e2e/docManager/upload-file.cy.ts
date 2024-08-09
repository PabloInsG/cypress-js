/// <reference types="Cypress"/>

import { uniqueNamesGenerator } from 'unique-names-generator';
import { nameGeneratorConfig } from '../../lib/utils';

describe('Test Doc Manager', () => {
  let users: UserCredentialOptions;
  let files: string[] = ['cypress/fixtures/Example1.pdf'];

  const office = Cypress.env('despacho');

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.goToDocManager(office);
  });

  it('Should be able to upload a document and delete it after that', () => {
    // UPLOAD ACTION
    // This test should click on upload button and upload a mockFile
    // https://www.cypress.io/blog/2022/01/19/uploading-files-with-selectfile/
    // we test UI, so after the upload action is complete we expect the upload notification box to update with
    // uploaded file and navigation pane to have uploaded file
    cy.get('.el-upload__input').selectFile(files[0], { force: true });
    const fileName = files[0].split('/').pop() as string;
    const extension = files[0].split('.').pop();
    const newFileName: string = uniqueNamesGenerator(nameGeneratorConfig);
    cy.get(`.el-input__inner[placeholder="${fileName}"]`)
      .clear()
      .type(newFileName + '.' + extension);
    cy.get('.el-button').contains('Confirmar').click();
    cy.findByTestId('dialog-upload-alert').findByTestId('success-button-icon');
    cy.getElementOfDocsList(newFileName);
    cy.findByTestId('check-main-list-' + newFileName).click();
    cy.findByTestId('multi-delete').click();
    cy.get('.el-input__inner[placeholder="1"]').type('1');
    cy.get('.el-button').contains('Ok').click();
  });
});
