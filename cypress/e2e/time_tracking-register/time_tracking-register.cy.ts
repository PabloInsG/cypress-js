/// <reference types='cypress' />

describe("Checking the employes working time", () => {

    const office = Cypress.env("despacho");
    let user;

    //Today date
    const todayDay = new Date().getDate();
    const todayMonth = new Date().getMonth();
    const todayYear = new Date().getFullYear();

    before(() => {
        cy.fixture('userPortalEmpleado').then(data => {
            user = data;
        });
    })

    // OK
    it("data should be displayed correctly in the tracking time table", () => {

        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/element_registries/qr?page=1&itemsPerPage=10&properties%5B0%5D=right.empleados.nombre&properties%5B1%5D=right.empleados.Grupo&properties%5B2%5D=tipo&properties%5B3%5D=ubicacion&properties%5B4%5D=fecha_creacion&properties%5B5%5D=id_creador&properties%5B6%5D=motivo&properties%5B7%5D=notas&return_totals=true")
            .as("consultaRegistros");

        cy.enterOfficeAndLogin(office, user.userName, user.userPassword);
        cy.clickOnModuleElement("Documentos", "Registro Horario");

        cy.wait("@consultaRegistros").then((response) => {

            const data = response.response?.body;

            //Get into the table
            cy.get(".el-table__body tbody tr").each(($tr, index) => {

                const tds = $tr.find("td");

                //We check the columns
                cy.tracking_hour_user(data, tds, todayDay, todayMonth, todayYear, index);
            });
        });
    });

    // OK
    it("an IN register should be added once a workday starts", () => {

        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/holidays?idUser=me&page=1&itemsPerPage=10&id=me&properties%5B0%5D=id&properties%5B1%5D=asunto&properties%5B2%5D=estado&properties%5B3%5D=fecha_inicio&properties%5B4%5D=fecha_fin&properties%5B5%5D=tipo&properties%5B6%5D=notas&properties%5B7%5D=numero_dias&filterGroup%5Bcondition%5D=AND&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Boperator%5D=equal&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bvalue%5D=Pendiente&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bproperty%5D=estado&filterGroup%5BfilterGroups%5D%5B0%5D%5Bcondition%5D=AND")
            .as("homePageLoading");

        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/element_registries/qr?page=1&itemsPerPage=10&properties%5B0%5D=right.empleados.nombre&properties%5B1%5D=right.empleados.Grupo&properties%5B2%5D=tipo&properties%5B3%5D=ubicacion&properties%5B4%5D=fecha_creacion&properties%5B5%5D=id_creador&properties%5B6%5D=motivo&properties%5B7%5D=notas&return_totals=true")
            .as("workdayRegister");

        cy.enterOfficeAndLogin(office, user.userName, user.userPassword);

        cy.wait("@homePageLoading");

        //Clicks on the button to start In event. IN register REQUEST
        cy.interceptCrmRequest({
            method: "POST",
            path: "timetracking",
            trigger: () => cy.get(".el-card__body .el-button").click(),
            callback: (response, status) => {
                expect(status).eq(200);
            }
        })

        cy.clickOnModuleElement("Documentos", "Registro Horario");

        //Checking out if the IN register is created
        cy.wait("@workdayRegister").then((response) => {

            let data = response.response?.body;

            cy.get(".el-table__body tbody tr").eq(0).then(($tr) => {

                const tds = $tr.find("td");

                // We check the columns 
                cy.tracking_hour_user(data, tds, todayDay, todayMonth, todayYear, 0);
            });
        });

        cy.get("img[alt=Logo]").eq(0).click();

        //Register the OUT workday
        cy.get(".el-card__body .el-button").eq(1).click();
    });

    // OK
    it("an OUT register should be added once a workday ends", () => {

        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/holidays?idUser=me&page=1&itemsPerPage=10&id=me&properties%5B0%5D=id&properties%5B1%5D=asunto&properties%5B2%5D=estado&properties%5B3%5D=fecha_inicio&properties%5B4%5D=fecha_fin&properties%5B5%5D=tipo&properties%5B6%5D=notas&properties%5B7%5D=numero_dias&filterGroup%5Bcondition%5D=AND&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Boperator%5D=equal&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bvalue%5D=Pendiente&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bproperty%5D=estado&filterGroup%5BfilterGroups%5D%5B0%5D%5Bcondition%5D=AND")
            .as("homePageLoading");

        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/element_registries/qr?page=1&itemsPerPage=10&properties%5B0%5D=right.empleados.nombre&properties%5B1%5D=right.empleados.Grupo&properties%5B2%5D=tipo&properties%5B3%5D=ubicacion&properties%5B4%5D=fecha_creacion&properties%5B5%5D=id_creador&properties%5B6%5D=motivo&properties%5B7%5D=notas&return_totals=true")
            .as("workdayRegister");

        cy.enterOfficeAndLogin(office, user.userName, user.userPassword);

        cy.wait("@homePageLoading");

        //Clicks on the button to start In event
        cy.get(".el-card__body .el-button").click()

        //OUT register REQUEST. Click on the out button
        cy.interceptCrmRequest({
            method: "POST",
            path: "timetracking",
            trigger: () => cy.get(".el-button.el-button--large").eq(1).click(),
            callback: (response, status) => {
                expect(status).eq(200);
            }
        })

        cy.clickOnModuleElement("Documentos", "Registro Horario");

        //Checking out if the IN register is created
        cy.wait("@workdayRegister").then((response) => {
            let data = response.response?.body;


            cy.get(".el-table__body tbody tr").eq(0).then(($tr) => {

                const tds = $tr.find("td");

                //We check the columns
                cy.tracking_hour_user(data, tds, todayDay, todayMonth, todayYear, 0);
            });
        });
    });

    // OK
    it("a PAUSE IN/OUT register should be added once a worker need it", () => {
        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/timetracking/list?idUser=me&page=1&itemsPerPage=15&properties%5B0%5D=id&properties%5B1%5D=tipo&properties%5B2%5D=fecha_creacion")
            .as("homePageLoading");

        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/element_registries/qr?page=1&itemsPerPage=10&properties%5B0%5D=right.empleados.nombre&properties%5B1%5D=right.empleados.Grupo&properties%5B2%5D=tipo&properties%5B3%5D=ubicacion&properties%5B4%5D=fecha_creacion&properties%5B5%5D=id_creador&properties%5B6%5D=motivo&properties%5B7%5D=notas&return_totals=true")
            .as("workdayRegister");

        cy.enterOfficeAndLogin(office, user.userName, user.userPassword);

        cy.wait("@homePageLoading");

        //Clicks on the button to start IN event
        cy.get(".el-card__body .el-button").click();

        //Notifications should appear
        cy.get(".el-notification").should("exist").and("be.visible");

        //Clicks on the button to start PAUSE event
        cy.get(".el-button.el-button--large").eq(0).click();
        cy.get(".el-select").contains("Seleccionar").click();
        cy.get(".el-select-dropdown__list").should("be.visible").contains("li", "Fumar").click();

        //PAUSE IN register REQUEST. Click on the out button
        cy.interceptCrmRequest({
            method: "POST",
            path: "timetracking",
            trigger: () => cy.contains(".el-button", "Pause").click(),
            callback: (response, status) => {

                expect(status).eq(200);
            }
        })

        cy.clickOnModuleElement("Documentos", "Registro Horario");

        //Checking out if the PAUSE IN register is created
        cy.wait("@workdayRegister").then((response) => {
            let data = response.response?.body;

            cy.get(".el-table__body tbody tr").eq(0).then(($tr) => {

                const tds = $tr.find("td");

                // We check the columns
                cy.tracking_hour_user(data, tds, todayDay, todayMonth, todayYear, 0);
            });
        });

        //Home page
        cy.get("img[alt=Logo]").eq(0).click();

        cy.interceptCrmRequest({
            method: "POST",
            path: "timetracking",
            trigger: () => cy.get(".el-card__body .el-button").click(), //Register the END of the PAUSE
            callback: (response, status) => {

                expect(status).eq(200);
            }
        });

        cy.get(".el-notification.right").should("be.visible");

        cy.clickOnModuleElement("Documentos", "Registro Horario");

        //Checking out if the PAUSE OUT register is created
        cy.wait("@workdayRegister").then((response) => {
            let data = response.response?.body;


            cy.get(".el-table__body tbody tr").eq(0).then(($tr) => {

                const tds = $tr.find("td");

                // We check the columns
                cy.tracking_hour_user(data, tds, todayDay, todayMonth, todayYear, 0);
            });
        });

        //Home page
        cy.get("img[alt=Logo]").eq(0).click();

        //Register the END of the PAUSE
        cy.get(".el-card__body .el-button").eq(1).click();
    });
});