/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe("Test for simple tasks actions", () => {
    let user;
    let client: NewClient;
    let task: NewTask;
    const relatedElement = 'clientes_propios';
    const element = 'actuaciones';
    const office = Cypress.env('despacho');

    const predefined1 = 'predefined' + new Date().getTime();

    before(() => {
        cy.fixture('userCRM').then(data => {
            user = data;
        });
        cy.fixture('new_client').then(data => {
            client = data;
        });
        cy.fixture('new_task').then(data => {
            task = data;
        });

        cy.interceptCrmRequest<ElementRegistriesResponse[]>({
            path: 'menus/me',
            trigger: () => cy.enterOfficeAndLogin(office, user.userName, user.userPassword),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        cy.interceptCrmRequest<ElementRegistriesResponse[]>({
            path: `element_registries/actuaciones`,
            trigger: () => cy.clickOnModuleElement('Gestión', 'Trabajos'),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Go to predefined tasks
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: 'predefined?',
            trigger: () => cy.findByTestId('predefinedTasksButton').click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //New predefined
        cy.GEN_predefined_actuacion(predefined1);
    });

    beforeEach(() => {
        cy.interceptCrmRequest<ElementRegistriesResponse[]>({
            path: 'menus/me',
            trigger: () => cy.enterOfficeAndLogin(office, user.userName, user.userPassword),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
        cy.interceptCrmRequest<ElementRegistriesResponse[]>({
            path: `element_registries/${relatedElement}?`,
            trigger: () => cy.clickOnModuleElement('Ficheros', 'Cliente'),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
    });

    it('should create a new test client', () => {
        cy.quickCreateRegister(client, relatedElement);
    });

    it(`test create task from modal`, () => {
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
        cy.wait(3000);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_registries/${element}/?`,
            trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
        cy.createTask(task);
    });

    it(`test search tasks from global quick search`, () => {
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
        cy.wait(3000);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_registries/${element}/?`,
            trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
        cy.globalCrmSearch(task.subject, element);
        cy.get('#ep-main-table').contains(task.subject);
    });

    it(`test edit task from preview drawer`, () => {
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
        cy.wait(3000);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_registries/${element}/?`,
            trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
        cy.globalCrmSearch(task.subject, element);
        cy.updateTask(task);
    });

    it("should global search and edit the new predefined", () => {

        cy.contains(".el-sub-menu__title", "Gestión").click({ force: true });

        cy.interceptCrmRequest({
            method: "GET",
            path: `view`,
            trigger: () => cy.contains('.el-menu-item', 'Tareas predefinidas').click({ force: true }),
            callback: (response, status) => {
                cy.wait(2000);
                expect(status).to.eq(200);
            },
        });

        //Global search
        cy.interceptCrmRequest(
            {
                method: "GET",
                path: "predefined",
                trigger: () => cy.findByTestId("globalQuickSearch").click({ force: true }).clear().type(predefined1 + '{enter}'),
                callback(body, status) {
                    expect(status).eq(200);
                },
            }
        );

        //Edition. Only modify the predefined state
        cy.findByTestId("openPreviewDrawerButton").click();
        cy.contains(".el-select__selected-item", "Hecho").click();
        cy.findByTestId('option-Planificado').click();

        cy.interceptCrmRequest({
            method: "PUT",
            path: "predefined/actuaciones",
            trigger: () => cy.findByTestId("createUpdateButton").click(), //Save
            callback(body, status) {
                expect(status).eq(200);
            },
        });

    });

    it(`should upload a predefined task for a client`, () => {

        //Search and take the test client
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        cy.wait(3000);

        //Waiting for 'Módulo actuaciones"
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_registries/${element}/?`,
            trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //'Predefinidas' button
        cy.findAllByTestId("export-view-button").first().click({ force: true });
        cy.wait(1000);
        cy.get(".el-dialog").should("be.visible");
        cy.wait(1000);

        cy.contains("div", predefined1).find("input[type=checkbox]").click({ force: true });

        //Verify if the relation between client and predefined task is created
        cy.interceptCrmRequest({
            method: "GET",
            path: "predefined",
            trigger: () => cy.findByTestId("config-save-button").click(),
            callback(body, status) {
                expect(status).eq(201);
            },
        });

        //Global search
        cy.findByTestId('globalQuickSearch').clear().type(predefined1);
        cy.interceptCrmRequest<ElementRegistriesResponse[]>({
            method: 'GET',
            path: `element_registries/actuaciones`,
            trigger: () => cy.findByTestId('quickSearchButton').click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Check if there is any register in the table
        cy.get(".el-table__body tbody tr").should("exist");

        //Delete the predefined
        cy.deleteTask();
    });

    it("should delete the predefined", () => {

        cy.contains(".el-sub-menu__title", "Gestión").click({ force: true });

        cy.interceptCrmRequest({
            method: "GET",
            path: `view`,
            trigger: () => cy.contains('.el-menu-item', 'Tareas predefinidas').click({ force: true }),
            callback: (response, status) => {
                cy.wait(2000);
                expect(status).to.eq(200);
            },
        });

        cy.interceptCrmRequest(
            {
                method: "GET",
                path: "predefined",
                trigger: () => cy.findByTestId("globalQuickSearch").click({ force: true }).clear().type(predefined1 + '{enter}'),
                callback(body, status) {
                    expect(status).eq(200);
                },
            }
        );

        cy.deleteTask();
    });

    it(`test delete task`, () => {
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
        cy.wait(3000);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_registries/${element}/?`,
            trigger: () => cy.goToRelationView('Historial', 'actuaciones'),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
        cy.globalCrmSearch(task.subject, element);
        cy.deleteTask();
    });

    it('should delete test client', () => {
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.deleteRegister();
    });
});