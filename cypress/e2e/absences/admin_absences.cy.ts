/// <reference types='cypress' />

describe("Checkout the absences uploads", () => {

    const office = Cypress.env('despacho');

    let user

    //Data to fill in the fields
    const timestamp = Date.now();

    const filename = "Example1.pdf";

    const data = {
        subject: "Prueba Cypress " + timestamp,
        type: "Baja medica",
        start_date: "2024-04-22",
        finish_date: "2024-04-22",
        description: "Prueba Cypress",
        urlFile: "cypress/fixtures/" + filename
    }

    before(() => {
        cy.fixture('adminPortalEmpleado').then(data => {
            user = data;
        });
    });

    // OK
    it("should upload an absence in admin role", () => {

        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/absences?page=1&itemsPerPage=10&totalItems=1&properties%5B0%5D=left.empleados.nombre&properties%5B1%5D=asunto&properties%5B2%5D=fecha_inicio&properties%5B3%5D=fecha_fin&properties%5B4%5D=estado&properties%5B5%5D=numero_dias&properties%5B6%5D=tipo&properties%5B7%5D=anho&properties%5B8%5D=notas&properties%5B9%5D=id&properties%5B10%5D=grupo_contable_id&properties%5B11%5D=id_creador&properties%5B12%5D=id_ultimo_modificador&properties%5B13%5D=fecha_creacion&properties%5B14%5D=fecha_ultima_modificacion")
            .as("absencesRequest");

        cy.intercept("POST", "https://api-crm.dev.iberley.org/api/absences")
            .as("absencesPOST");

        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/user-related-companies")
            .as("completeView"); //Page where the absence data is displayed (i.e. url: ficheros/absences/175)


        cy.enterOfficeAndLogin(office, user.userName, user.userPassword);
        cy.clickOnModuleElement('Ficheros', 'Ausencias');
        cy.wait(2000);

        cy.get("[data-testid=create-absences-button]").click();

        cy.get(".el-dialog").should("be.visible");

        // --Creating abscene--

        cy.get("[data-testid=input-subject-absences] input").clear().type(data.subject); //Subject

        cy.get("[data-testid=input-type-absences]").click();
        cy.get(".el-vl__window").within(() => {
            cy.contains("span", data.type).click({ force: true }); //Type
        });

        //Dates
        cy.get("#date-picker-start-date").clear().type(data.start_date);
        cy.get("#date-picker-end-date").clear().type(data.finish_date);

        cy.writeInTiny(data.description); //Description

        cy.get("[data-testid=submit-task-form-modal]").click()

        //We verify the if the absence was sent and if the data is well displayed
        cy.wait(["@absencesRequest", "@absencesPOST"]).then(([requestResponse, postResponse]) => {

            expect(postResponse.response?.statusCode).eq(200);

            const days_left = requestResponse.response?.body["items"][0]["values"][5]["value"];

            cy.wait(2000); // Bad!!

            //Checking data in the table
            cy.get(".el-table__body tbody tr").first().then((tr) => {

                const tds = tr.find("td");

                cy.wrap(tds).eq(2).should("contain", data.subject);
                cy.wrap(tds).eq(3).should("contain", data.start_date);
                cy.wrap(tds).eq(4).should("contain", data.finish_date);
                cy.wrap(tds).eq(5).should("contain", "Pendiente");
                cy.wrap(tds).eq(6).should("contain", days_left);
                cy.wrap(tds).eq(7).should("contain", data.type);
                cy.wrap(tds).eq(9).should("contain", data.description);
            });
        });
        // Home page
        cy.get("img[alt=Logo]").eq(0).click();


        // --SHOULD UPLOAD AN ABSENCE WITH FILES (admin)--

        cy.clickOnModuleElement('Ficheros', 'Ausencias');
        cy.wait(2000);

        cy.get("[data-testid=create-absences-button]").click();

        cy.get(".el-dialog").should("be.visible");

        //Creating abscene

        cy.get("[data-testid=input-subject-absences] input").clear().type(data.subject); //Subject

        cy.get("[data-testid=input-type-absences]").click();
        cy.get(".el-vl__window").within(() => {
            cy.contains("span", data.type).click({ force: true }); //Type
        });

        //Dates
        cy.get("#date-picker-start-date").clear().type(data.start_date);
        cy.get("#date-picker-end-date").clear().type(data.finish_date);

        cy.get(".el-upload__input").selectFile(data.urlFile, { force: true }); //Files

        cy.writeInTiny(data.description); //Description

        cy.get("[data-testid=submit-task-form-modal]").click()

        //We verify the if the absence was sent and if the data is well displayed
        cy.wait(["@absencesRequest", "@absencesPOST"]).then(([requestResponse, postResponse]) => {

            expect(postResponse.response?.statusCode).eq(200);

            const days_left = requestResponse.response?.body["items"][0]["values"][5]["value"];

            //Checking data in the table
            cy.get(".el-table__body tbody tr").first().then((tr) => {

                const tds = tr.find("td");

                cy.wrap(tds).eq(2).should("contain", data.subject);
                cy.wrap(tds).eq(3).should("contain", data.start_date);
                cy.wrap(tds).eq(4).should("contain", data.finish_date);
                cy.wrap(tds).eq(5).should("contain", "Pendiente");
                cy.wrap(tds).eq(6).should("contain", days_left);
                cy.wrap(tds).eq(7).should("contain", data.type);
                cy.wrap(tds).eq(9).should("contain", data.description);

                // --File verification--
                cy.wrap(tds).eq(1).click();
                cy.wait("@completeView");
                cy.wait(1000); // Bad!!
                cy.get("[data-testid=detail_view_section_tab__Datos]").click()
                cy.get("[data-testid=relation_tab__gdocu]").click()

                cy.get(".el-table-v2__row").first().find(".el-table-v2__row-cell").eq(1).should("contain", filename);
            });
        });
    });
});