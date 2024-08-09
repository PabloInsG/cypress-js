/// <reference types='cypress' />

describe("Test for the related clients taxes", () => {

    let user;
    let client: NewClient;
    let taxe;
    const relatedElement = 'clientes_propios';
    const office = Cypress.env('despacho');

    const predefined = ["Modelo 111 - 1º T (Autoliquidación)", "Modelo 111 - 2º T (Autoliquidación)"];

    // Current date
    const noFormatDate = new Date();

    // Obtener el año, mes y día
    const year = noFormatDate.getFullYear();
    const month = String(noFormatDate.getMonth() + 1).padStart(2, '0'); // Se suma 1 al mes ya que los meses van de 0 a 11
    const day = String(noFormatDate.getDate()).padStart(2, '0');

    // Construir la fecha en formato año-mes-día
    const ISOedDate = `${year}-${month}-${day}`;

    before(() => {
        cy.fixture('userCRM').then(data => {
            user = data;
        });
        cy.fixture('new_client').then(data => {
            client = data;
        });
        cy.fixture('new_taxe').then((data) => {
            taxe = data;
        });
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

    it("should create a new client", () => {
        cy.quickCreateRegister(client, relatedElement);
    });

    it("create a new taxe from a client", () => {

        //Search and take the test client
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Waiting for 'Módulo obligaciones"
        cy.interceptCrmRequest({
            path: `taxes`,
            trigger: () => cy.goToRelationView('Obligaciones', "actuaciones_obligaciones"),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        cy.findAllByTestId('create-task-button').click({ force: true });

        cy.fillOutTaxesForm(taxe, false);

        cy.get('#crono').then($modal => {
            cy.wrap($modal).findByTestId('input-duration-hours')
                .filter(':visible')
                .children()
                .last()
                .children()
                .first()
                .type('2');
        });

        cy.interceptCrmRequest({
            method: "POST",
            path: "taxes",
            trigger: () => cy.findByTestId("createUpdateButton").click(),
            callback(body, status) {
                expect(status).eq(201);
            }
        });
    });

    it("should search in global filters and edit a taxe from drawer", () => {
        //Search and take the test client
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Waiting for 'Módulo obligaciones"
        cy.interceptCrmRequest({
            path: `taxes`,
            trigger: () => cy.goToRelationView('Obligaciones', "actuaciones_obligaciones"),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Global search
        cy.findByTestId('globalQuickSearch').clear().type(taxe.subject);
        cy.interceptCrmRequest<ElementRegistriesResponse[]>({
            method: 'GET',
            path: `taxes`,
            trigger: () => cy.findByTestId('quickSearchButton').click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        cy.findAllByTestId('preview-drawer-button').first().click();

        cy.fillOutTaxesForm(taxe, false); //Filling the inputs with new data

        cy.interceptCrmRequest<ElementRegistriesResponse[]>({
            method: 'PATCH',
            path: 'taxes',
            trigger: () => cy.findAllByTestId('submit-task-form-drawer').last().click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });
    });

    it("should add a new file from drawer", () => {
        //Search and take the test client
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Waiting for 'Módulo obligaciones"
        cy.interceptCrmRequest({
            path: `taxes`,
            trigger: () => cy.goToRelationView('Obligaciones', "actuaciones_obligaciones"),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        cy.findAllByTestId('preview-drawer-button').first().click(); //Selecting a taxe to edit

        //Upload a new file
        cy.get(".el-upload__input").selectFile("cypress/fixtures/Example1.pdf", { force: true });

        cy.interceptDocManagerRequest(
            {
                method: "POST",
                path: "files/uploaded-file",
                trigger: () => cy.findByTestId("submit-task-form-drawer").click({ force: true }),
                callback(body, status) {
                    expect(status).eq(201);
                },
            }
        );
    });

    it("should add an existing file from drawer", () => {
        //Search and take the test client
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Waiting for 'Módulo obligaciones"
        cy.interceptCrmRequest({
            path: `taxes`,
            trigger: () => cy.goToRelationView('Obligaciones', "actuaciones_obligaciones"),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        cy.findAllByTestId('preview-drawer-button').first().click(); //Selecting a taxe to edit

        //Upload an existing file
        cy.findAllByTestId("dropdown-upload-button").eq(1).click();
        cy.contains("Selecciona existente").click();
        cy.get(".document").first().click('left'); //Existing file

        cy.interceptCrmRequest(
            {
                method: "POST",
                path: "relation_element/gdocu",
                trigger: () => cy.findByTestId("submit-task-form-drawer").click({ force: true }),
                callback(body, status) {
                    expect(status).eq(201);
                },
            }
        );
    });

    it("should delete a taxe", () => {
        //Search and take the test client
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Waiting for 'Módulo obligaciones"
        cy.interceptCrmRequest({
            path: `taxes`,
            trigger: () => cy.goToRelationView('Obligaciones', "actuaciones_obligaciones"),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        cy.findByTestId('globalQuickSearch').clear().type(taxe.subject);
        cy.interceptCrmRequest<ElementRegistriesResponse[]>({
            method: 'GET',
            path: `taxes`,
            trigger: () => cy.findByTestId('quickSearchButton').click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        cy.get('#ep-main-table').find('.el-checkbox').eq(1).click({ force: true });
        cy.get('button').contains('Borrar').click({ force: true });
        cy.get('input[placeholder=1]').type('1');
        cy.get('.el-dialog').find('button').eq(1).click();
        cy.get('.el-message__content');

    });

    it("should upload a predefined taxe from a client", () => {
        //Search and take the test client
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Waiting for 'Módulo obligaciones"
        cy.interceptCrmRequest({
            path: `taxes`,
            trigger: () => cy.goToRelationView('Obligaciones', "actuaciones_obligaciones"),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //'Predefinidas' button
        cy.findAllByTestId("export-view-button").first().click({ force: true });
        cy.wait(1000);
        cy.get(".el-dialog").should("be.visible");
        cy.wait(1000);

        //Get 'Modelo 111 - 1º T (Autoliquidación)' as predefined
        cy.contains("[data-key]", predefined[0]).find("input[type=checkbox]").click({ force: true });

        //Verify if the relation between client and predefined taxe is created
        cy.interceptCrmRequest({
            method: "POST",
            path: "relation_element/actuaciones_obligaciones",
            trigger: () => cy.findByTestId("config-save-button").click(),
            callback(body, status) {
                expect(status).eq(201);
            },
        });

        //Global search
        cy.findByTestId('globalQuickSearch').clear().type(predefined[0]);
        cy.interceptCrmRequest<ElementRegistriesResponse[]>({
            method: 'GET',
            path: `taxes`,
            trigger: () => cy.findByTestId('quickSearchButton').click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Check if there is any register in the table
        cy.get(".el-table__body tbody tr").should("exist").first().then((tr) => {

            const tds = tr.find("td");

            cy.wrap(tds).eq(2).should("contain", "hoy a las");
        });

        //Delete the register
        cy.get('#ep-main-table').find('.el-checkbox').eq(1).click({ force: true });
        cy.get('button').contains('Borrar').click({ force: true });
        cy.get('input[placeholder=1]').type('1');
        cy.get('.el-dialog').find('button').eq(1).click();
        cy.get('.el-message__content');
    });

    it("should upload more than one predefined taxe from a client", () => {
        //Search and take the test client
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //Waiting for 'Módulo obligaciones"
        cy.interceptCrmRequest({
            path: `taxes`,
            trigger: () => cy.goToRelationView('Obligaciones', "actuaciones_obligaciones"),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        //'Predefinidas' button
        cy.findAllByTestId("export-view-button").first().click({ force: true });
        cy.get(".el-dialog").should("be.visible");
        cy.wait(1000);

        //Get 'Modelo 111 - 1º T (Autoliquidación)' & 'Modelo 111- 2º T (Autoliquidación)' as predefined
        cy.contains("[data-key=2]", predefined[0]).find("input[type=checkbox]").click({ force: true });
        cy.contains("[data-key=3]", predefined[1]).find("input[type=checkbox]").click({ force: true });


        //Verify if the relation between client and predefined taxe is created
        cy.interceptCrmRequest({
            method: "POST",
            path: "taxes/bulk/create/predefines",
            trigger: () => cy.findByTestId("config-save-button").click(),
            callback(body, status) {
                expect(status).eq(201);
            },
        });

        for (let i = 0; i < 2; i++) {
            //Global search
            cy.findByTestId('globalQuickSearch').clear().type(predefined[i]);
            cy.interceptCrmRequest<ElementRegistriesResponse[]>({
                method: 'GET',
                path: `taxes`,
                trigger: () => cy.findByTestId('quickSearchButton').click(),
                callback: (response, status) => {
                    expect(status).to.eq(200);
                },
            });

            //Check if there is any register in the table
            cy.get(".el-table__body tbody tr").should("exist").first().then((tr) => {

                const tds = tr.find("td");

                cy.wrap(tds).eq(2).should("contain", "hoy a las");
            });

            //Delete the register
            cy.get('#ep-main-table').find('.el-checkbox').eq(1).click({ force: true });
            cy.get('button').contains('Borrar').click({ force: true });
            cy.get('input[placeholder=1]').type('1');
            cy.get('.el-dialog').find('button').eq(1).click();
            cy.get('.el-message__content');
        }
    });

    it("should delete test client", () => {
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.deleteRegister();
    });
});