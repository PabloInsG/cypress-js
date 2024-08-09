/// <reference types="cypress" />
import 'cypress-localstorage-commands';

describe('PredefinedTasks', () => {
  let user
  const office = Cypress.env('despacho');
  const folderName = 'New Predefined Folder';

  before(() => {
    cy.fixture('userCRM').then(data => {
      user = data;
    });
  });

  beforeEach(() => {
    cy.enterOfficeAndLogin(office, user.userName, user.userPassword);
    cy.clickOnModuleElement('Gestión', 'Trabajos');
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'predefined?',
      trigger: () => cy.findByTestId('predefinedTasksButton').click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
  });

  it(`Test Create Predefined`, () => {
    cy.GEN_predefined_actuacion('predefinida');
  });

  it(`Test Search Predefined`, () => {
    cy.get('body').click({ force: true });
    cy.findByTestId('globalQuickSearch').click().type('predefinida');
  });

  it(`Test Edit Predefined`, () => {
    cy.get('body').click({ force: true });
    cy.findAllByTestId('openPreviewDrawerButton').first().click();
    cy.findByTestId('registrationDatePicker').find('input').click();
    cy.get('.el-picker__popper').find('table:visible').find('td:visible').last().click();
    cy.findByTestId('dueDatePicker').find('input').click();
    cy.get('.el-picker__popper').find('table:visible').find('td:visible').last().click();
    cy.findByTestId('subjectInput').find('input').click().clear().type('predefinida');
    cy.findByTestId('prioritySelect').click();
    cy.findByTestId('option-Baja').click();
    cy.findByTestId('stateSelect').click();
    cy.findByTestId('option-Planificado').click();
    cy.findByTestId('folderSelect').click();
    cy.get('.el-select__popper[aria-hidden="false"]').find('.el-select-dropdown__item').contains("General").click();
    cy.intercept('PUT', 'https://api-crm.dev.iberley.org/api/predefined/actuaciones/*').as(
      'putData',
    );
    cy.findByTestId('createUpdateButton').click();
    cy.wait('@putData');
  });

  it(`Test Delete Predefined`, () => {
    cy.get('body').click({ force: true });
    cy.get('.el-table__body').find('.el-checkbox').eq(1).click();
    cy.get('button')
      .contains(/Borrar/i)
      .click();
    cy.get('input[placeholder=1]:visible').clear().type('1');
    cy.get('.el-dialog').find('button:visible').eq(1).click();
    cy.get('.el-message__content:visible');
  });

  it(`Test Create folder in the folder tree`, () => {
    cy.get('body').click({ force: true });
    cy.findByTestId('folder-id-1').rightclick();
    cy.interceptCrmRequest<NewPredefinedFolder>({
      method: 'POST',
      path: 'folders/actuaciones/1',
      trigger: () => cy.findByTestId('create-folder-button-1').should('be.visible').click(),
      callback: (body, status) => {
        expect(status, 'status shoul be 201, create a resource').eq(201);
        // Check the new folder created
        cy.findByTestId(`folder-id-${body.id}`).as('folderCreated');
        cy.get('@folderCreated').should('be.visible');
        // Rename folder
        cy.get('@folderCreated').rightclick();
        cy.findByTestId(`change-name-folder-button-${body.id}`).click();
        cy.get('.el-message-box__input').should('be.visible').find('input').type(folderName);
        cy.get('.el-message-box__btns')
          .contains(/confirmar/i)
          .click();
        // Check if the rename is ok
        cy.findByTestId(`folder-id-${body.id}`).should('contain', folderName);
      },
    });
  });

  it(`Test Edit name of folder in the folder tree`, () => {
    cy.get('body').click({ force: true });
    cy.get('.el-tree-node')
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

  it(`Test Delete folder in the folder tree`, () => {
    cy.get('body').click({ force: true });
    cy.get('.el-tree-node').contains(folderName).should('be.visible').as('folder');
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
        cy.get('.el-message .el-message__content')
          .contains(/borrado completado/i)
          .should('be.visible')
          .then($message => {
            cy.wrap($message).should('not.be.visible');
          });
        cy.findByTestId(`folder-id-${idFolder}`).should('not.exist');
      });
  });
});
