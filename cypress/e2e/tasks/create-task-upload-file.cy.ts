/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('test crate task and upload files', () => {
  let users: UserCredentialOptions;
  let task: NewTask;
  const element = 'actuaciones';
  const fileName1 = 'Example1.pdf';
  const fileName2 = 'Example2.pdf';
  let totalItems: number = 2;
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

  beforeEach(() => {
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: 'menus/me',
      trigger: () => cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      path: `element_registries/${element}?`,
      trigger: () => cy.clickOnModuleElement('Gestión', actuacionesLabel),
      callback: (body, status) => {
        expect(status).to.eq(200);
      },
    });
  });

  it('test create task from modal and upload a new file', () => {
    cy.get('body').click({ force: true });
    cy.findByTestId('create-task-dropdown').click('center');
    cy.findByTestId('create-task-button').click('center');
    cy.findByTestId('input-subject').last().click().type(task.subject);
    cy.get('#select-task-priority').click({ force: true });
    cy.findByTestId('option-Alta').click({ force: true });
    cy.get('#select-task-state').click({ force: true });
    cy.findByTestId('option-Planificado').click({ force: true });
    cy.findByTestId('dropdown-upload-button').click();
    cy.get('ul.el-dropdown-menu:visible');
    cy.get('input.el-upload__input').selectFile(`cypress/fixtures/${fileName1}`, { force: true });
    cy.interceptDocManagerRequest<UpLoadFileTaskResponse>({
      method: 'POST',
      path: 'files/uploaded-file',
      trigger: () => cy.findByTestId('submit-task-form-modal').click(),
      callback: (body, status) => {
        expect(status).to.eq(201);
      },
    });
  });

  it('test created task has file at its doc-manager and upload a second file', () => {
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.get('#ep-main-table').contains(task.subject);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'element_register/actuaciones/?',
      trigger: () => cy.findAllByTestId('rowDetailLink').first().click(),
      callback: (body, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(2000);
    cy.findAllByTestId('detail_view_section_tab__Historial')
      .should('not.have.class', 'is-disabled')
      .first()
      .click();
    cy.wait(2000);
    cy.findAllByTestId('table-list-gdocu')
      .first()
      .should('exist')
      .and('be.visible')
      .as('tablaDocumentos');
    cy.get('@tablaDocumentos').contains(fileName1);
    cy.get('input.el-upload__input')
      .first()
      .selectFile(`cypress/fixtures/${fileName2}`, { force: true });
    cy.wait(500);
    cy.get('.el-message-box__input')
      .should('be.visible')
      .find('input')
      .clear()
      .type('Edited' + fileName2);
    cy.interceptDocManagerRequest<UpLoadFileTaskResponse>({
      method: 'POST',
      path: 'files/uploaded-file',
      trigger: () =>
        cy
          .get('.el-message-box__btns')
          .contains(/confirmar/i)
          .click({ force: true }),
      callback: (body, status) => {
        expect(status).to.equal(201);
        cy.findByTestId('dialog-upload-alert')
          .should('be.visible')
          .then($alert => {
            cy.wrap($alert).should('not.be.visible');
          });
        cy.get('body').click({ force: true });
        cy.findAllByTestId('table-list-gdocu')
          .first()
          .should('exist')
          .and('be.visible')
          .find('.document-name')
          .contains('Edited' + fileName2)
          .should('be.visible');
      },
    });
  });

  it('test create task from modal and relate an existing file', () => {
    cy.get('body').click({ force: true });
    cy.findByTestId('create-task-button').first().click({ force: true });
    cy.findByTestId('input-subject').last().click().type(task.subject);
    cy.get('#select-task-priority').click({ force: true });
    cy.findByTestId('option-Alta').click({ force: true });
    cy.get('#select-task-state').click({ force: true });
    cy.findByTestId('option-Planificado').click({ force: true });
    cy.findByTestId('dropdown-upload-button').click();
    cy.get('ul.el-dropdown-menu:visible')
      .findByTestId('dropdown_option__Selecciona existente')
      .click();
    cy.get('.el-drawer__body')
      .contains('Edited' + fileName2)
      .dblclick();
    cy.get('.el-overlay:visible').first().click();
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      method: 'POST',
      path: 'element_register/actuaciones?',
      trigger: () => cy.findByTestId('submit-task-form-modal').click(),
      callback: (body, status) => {
        expect(status).to.eq(201);
      },
    });
  });

  it('test created task has both files at its doc-manager and delete both', () => {
    cy.allFiltersSearch(task.subject, element, 'Asunto');
    cy.get('#ep-main-table').contains(task.subject);
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'element_register/actuaciones/?',
      trigger: () => cy.findAllByTestId('rowDetailLink').eq(1).click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.wait(2000);
    cy.findAllByTestId('detail_view_section_tab__Historial')
      .should('not.have.class', 'is-disabled')
      .first()
      .click();
    cy.wait(2000);
    cy.findAllByTestId('table-list-gdocu')
      .first()
      .should('exist')
      .and('be.visible')
      .as('tablaDocumentos');
    cy.get('@tablaDocumentos').contains(fileName1);
    cy.get('@tablaDocumentos').contains('Edited' + fileName2);
    cy.findAllByTestId('globalQuickSearch').first().clear().type('Example');
    cy.interceptCrmRequest<ElementRegistriesResponse[]>({
      method: 'GET',
      path: `element_registries/gdocu?`,
      trigger: () => cy.findAllByTestId('globalQuickSearchPrepend').first().click(),
      callback: (response, status) => {
        expect(status).to.eq(200);
      },
    });
    cy.findAllByTestId('table-list-gdocu')
      .first()
      .should('exist')
      .and('be.visible')
      .find('.el-checkbox')
      .eq(0)
      .should('exist')
      .should('be.visible', { timeout: 10000 })
      .click();
    cy.findAllByTestId('table-list-gdocu')
      .first()
      .should('exist')
      .and('be.visible')
      .find('.el-checkbox')
      .eq(1)
      .should('exist')
      .should('be.visible', { timeout: 10000 })
      .click();
    cy.wait(2000);
    cy.get('button').contains('Borrar').should('exist').and('be.visible').click({ force: true });
    cy.get(`input[placeholder=2]:visible`).type(String(2));
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      method: 'DELETE',
      path: 'element_register/mass/gdocu?',
      trigger: () => cy.get('.el-dialog').find('button:visible').eq(1).click(),
      callback: (body, status) => {
        expect(status).to.eq(202);
      },
    });
  });

  it(`test delete all tasks sorted`, () => {
    cy.get('body').click({ force: true });
    cy.interceptCrmRequest<ElementRegistriesResponse>({
      path: 'element_registries/actuaciones?',
      trigger: () => cy.allFiltersSearch(task.subject, element, 'Asunto'),
      callback: (body, status) => {
        expect(status).to.eq(200);
        totalItems = body.totalItems;
        cy.get('body').click({ force: true });
        cy.get('#ep-main-table')
          .should('exist')
          .and('be.visible')
          .find('.el-checkbox')
          .eq(0)
          .click({ force: true });
        cy.get('button').contains('Borrar').click({ force: true });
        totalItems = totalItems > 10 ? 10 : totalItems;
        cy.get(`input[placeholder=${totalItems}]:visible`).type(String(totalItems));
        if (totalItems === 1)
          cy.interceptCrmRequest<ElementRegistriesResponse>({
            method: 'DELETE',
            path: 'element_register/actuaciones?',
            trigger: () => cy.get('.el-dialog').find('button:visible').eq(1).click(),
            callback: (body, status) => {
              expect(status).to.eq(202);
            },
          });
        else
          cy.interceptCrmRequest<ElementRegistriesResponse>({
            method: 'DELETE',
            path: 'element_register/mass/actuaciones?',
            trigger: () => cy.get('.el-dialog').find('button:visible').eq(1).click(),
            callback: (body, status) => {
              expect(status).to.eq(202);
            },
          });
      },
    });
  });
});
