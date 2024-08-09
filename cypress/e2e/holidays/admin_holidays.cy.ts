/// <reference types='cypress' />

describe("Testing holidays page as admin", () => {

    const office = Cypress.env('despacho');

    let user

    const timestamp = Date.now();

    const filename = "Example1.pdf";

    //Data to fill in the fields
    const data = {
        subject: "Vacaciones con Cypress" + timestamp,
        start_date: "2024-04-22",
        finish_date: "2024-04-22",
        description: "Describiendo pruebas de vacaciones",
        urlFile: "cypress/fixtures/" + filename
    };

    before(() => {
        cy.fixture('adminPortalEmpleado').then(data => {
            user = data;
        });
    });

    it("should register the holidays", () => {

        cy.intercept("POST", "https://api-crm.dev.iberley.org/api/holidays")
            .as("holidaysPOST");
        cy.intercept("GET", 'https://api-crm.dev.iberley.org/api/holidays?page=1&itemsPerPage=10*')
            .as("holidaysRequest");
        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/user-related-companies")
            .as("completeView"); //Page where the holidays data is displayed (i.e. url: ficheros/holidays/175)

        cy.enterOfficeAndLogin(office, user.userName, user.userPassword);
        cy.clickOnModuleElement("Ficheros", "Vacaciones");

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
            cy.holidays_table_admin(data, days_left);
        });
        // Home page
        cy.get("img[alt=Logo]").eq(0).click();


        // --SHOULD REGISTER THE HOLIDAYS WITH FILES--

        cy.clickOnModuleElement("Ficheros", "Vacaciones");

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
            cy.holidays_table_admin(data, days_left, filename, 1);
        });
    });
});