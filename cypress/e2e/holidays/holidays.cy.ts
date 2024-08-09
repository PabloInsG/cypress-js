/// <reference types='cypress' />

describe("Testing holidays page", () => {

    const office = Cypress.env('despacho');

    let user

    const timestamp = Date.now();

    //Data to fill in the fields
    const data = {
        subject: "Vacaciones con Cypress" + timestamp,
        start_date: "2024-04-22",
        finish_date: "2024-04-22",
        description: "Describiendo pruebas de vacaciones",
        urlFile: "cypress/fixtures/Example1.pdf"
    };

    before(() => {
        cy.fixture('userPortalEmpleado').then(data => {
            user = data;
        });
    });

    it("should register the holidays", () => {

        cy.intercept("POST", "https://api-crm.dev.iberley.org/api/holidays")
            .as("holidaysPOST");
        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/holidays?page=1&itemsPerPage=10&totalItems=1&sort%5Bproperty%5D=asunto&sort%5Bdirection%5D=DESC&properties%5B0%5D=left.empleados.nombre&properties%5B1%5D=asunto&properties%5B2%5D=fecha_inicio&properties%5B3%5D=anho&properties%5B4%5D=fecha_fin&properties%5B5%5D=numero_dias&properties%5B6%5D=estado&properties%5B7%5D=tipo&properties%5B8%5D=id&properties%5B9%5D=grupo_contable_id&properties%5B10%5D=id_creador&properties%5B11%5D=id_ultimo_modificador&properties%5B12%5D=fecha_creacion&properties%5B13%5D=fecha_ultima_modificacion")
            .as("holidaysRequest");


        cy.enterOfficeAndLogin(office, user.userName, user.userPassword);
        cy.clickOnModuleElement("Documentos", "Vacaciones");

        // --Registering the holidays--
        cy.get("[data-testid=create-holidays-button]").click();
        cy.get("[data-testid=create-holidays-modal]").should("be.visible");


        cy.get("[data-testid=input-subject-holiday] input").type(data.subject); //Subject

        //Dates
        cy.get("#date-picker-start-date").clear().type(data.start_date);
        cy.get("#date-picker-end-date").clear().type(data.finish_date);

        cy.writeInTiny(data.description); //Description

        cy.get("[data-testid=submit-holidays-form-modal]").click();

        cy.wait(["@holidaysRequest", "@holidaysPOST"]).then(([requestResponse, postResponse]) => {

            expect(postResponse.response?.statusCode).eq(200);

            const days_left = requestResponse.response?.body["items"][0]["values"][5]["value"];

            //Checking data in the table
            cy.holidays_table_user(data, days_left);
        });
        // Home page
        cy.get("img[alt=Logo]").eq(0).click();


        // --SHOULD REGISTER THE HOLIDAYS WITH FILES--

        cy.clickOnModuleElement("Documentos", "Vacaciones");

        // --Registering the holidays--
        cy.get("[data-testid=create-holidays-button]").click();
        cy.get("[data-testid=create-holidays-modal]").should("be.visible");


        cy.get("[data-testid=input-subject-holiday] input").type(data.subject); //Subject

        //Dates
        cy.get("#date-picker-start-date").clear().type(data.start_date);
        cy.get("#date-picker-end-date").clear().type(data.finish_date);

        cy.get(".el-upload__input").selectFile(data.urlFile, { force: true }); //File

        cy.writeInTiny(data.description); //Description

        cy.get("[data-testid=submit-holidays-form-modal]").click();

        cy.wait(["@holidaysRequest", "@holidaysPOST"]).then(([requestResponse, postResponse]) => {

            expect(postResponse.response?.statusCode).eq(200);

            const days_left = requestResponse.response?.body["items"][0]["values"][5]["value"];

            //Checking data in the table
            cy.holidays_table_user(data, days_left);
        });
    });
});