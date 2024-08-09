/// <reference types="cypress" />

import 'cypress-localstorage-commands';

describe('Test emails list request has different payload for the first item on the list and for the last one', () => {
    let users: UserCredentialOptions;
    let previousId = null;
    let currentId = null;
    const office = Cypress.env('despacho');
    let client: NewClient;
    const relatedElement = 'clientes_propios';
    const file = "cypress/fixture/Example1.pdf";


    before(() => {
        cy.fixture('users').then(data => {
            users = data;
        });
        cy.fixture('new_client').then(data => {
            client = data;
        });
    });

    beforeEach(() => {
        cy.enterOfficeAndLogin(office, users.okUsername, users.okPassword);
        cy.clickOnModuleElement("Ficheros", "Clientes");
    });

    it(`should create a test client`, () => {
        cy.quickCreateRegister(client, relatedElement);
    });

    it("should upload a file to document manager", () => {
        //Upload the file
        cy.clickOnModuleElement("Gestor Documental", "Gestor Documental");
        cy.get(".el-upload__input").selectFile(file);
    });

    it("should create an email draft with file", () =>{
        //Search the client
        cy.globalCrmSearch(client.nombre, relatedElement);
        cy.interceptCrmRequest<ElementRegistriesResponse>({
            path: `element_register/${relatedElement}/?`,
            trigger: () => cy.findAllByTestId('rowDetailLink').eq(0).click(), //Select first row
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        });

        "E-mail module"
        cy.clickOnModuleElement("Historial", "relation_tab__mail");

        //Create the draft
        cy.get("#create-email-modal").click({force: true});
        cy.get(".el-upload__input").selectFile(file); //New file
        cy.contains("dropdown_option__Selecciona existente").click({force: true});
    });

    

});
