/// <reference types="Cypress"/>

describe('Test Doc Manager', () => {
  let users: UserCredentialOptions;
  const office = Cypress.env('despacho');
  const folderName = 'Carpeta Postal - Cypress';

  before(() => {
    cy.fixture('users').then(data => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
    cy.goToDocManager(office);
  });

  it('should create a new folder and change its name', () => {
    cy.findByTestId('folder-id-1').rightclick();
    cy.interceptDocManagerRequest<NewFolder>({
      method: 'POST',
      path: 'folders/1/',
      trigger: () => cy.findByTestId('create-folder-button-1').should('be.visible').click(),
      callback: (body, status) => {
        expect(status, 'status shoul be 201, create a resource').eq(201);
        cy.findByTestId(`folder-id-${body.folderId}`).as('folderCreated');
        cy.get('@folderCreated').should('be.visible');
        // Rename folder
        cy.get('@folderCreated').rightclick();
        cy.findByTestId(`change-name-folder-button-${body.folderId}`).click();
        cy.get('.el-message-box__input').should('be.visible').find('input').type(folderName);
        cy.get('.el-message-box__btns')
          .contains(/confirmar/i)
          .click();
        cy.findByTestId(`folder-id-${body.folderId}`).should('contain', folderName);
      },
    });
  });

  it('should rename the folder', () => {
    cy.get('.el-tree-node__children')
      .contains(folderName)
      .rightclick()
      .then($folder => {
        cy.wrap($folder)
          .invoke('attr', 'data-testid')
          .then($attributeValue => {
            if (!$attributeValue) throw new Error('attribute value is undefined');
            // get id from data attribute - folder-id-{id}
            const idFromFolderSelected = $attributeValue.split('-')[2];
            cy.findByTestId(`change-name-folder-button-${idFromFolderSelected}`).click();
            cy.get('.el-message-box').find('input').type(folderName);
            cy.get('.el-message-box__btns')
              .contains(/confirmar/i)
              .click();
            cy.get('.el-message--success')
              .should('be.visible')
              .then($messageSucces => {
                cy.wrap($messageSucces).should('not.be.visible');
              });
            cy.findByTestId(`folder-id-${idFromFolderSelected}`).contains(folderName);
          });
      });
  });

  it('should delete the folder', () => {
    cy.get('.el-tree-node__children').contains(folderName).should('be.visible').as('folder');
    cy.get('@folder').rightclick();
    cy.get('@folder')
      .invoke('attr', 'data-testid')
      .then(dataId => {
        // dataId has "folder-id-{id}" format. We need to get {id}. Split string and get id
        if (!dataId) throw new Error('Attribute is undefined');
        const idFolder = dataId.split('-')[2]; // ['folder', 'id', '{id}']
        cy.findByTestId(`delete-folder-button-${idFolder}`).click();
        cy.get('.el-message-box')
          .should('be.visible')
          .find('button')
          .contains(/confirmar/i)
          .click();
        cy.get('.el-message__content')
          .contains(/borrado completado/i)
          .should('be.visible')
          .then($message => {
            cy.wrap($message).should('not.be.visible');
          });
        cy.findByTestId(`folder-id-${idFolder}`).should('not.exist');
      });
  });
});
