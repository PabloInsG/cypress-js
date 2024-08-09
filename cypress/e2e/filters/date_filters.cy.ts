/// <reference types='cypress' />
 
describe("Testing the date filters in the workday tracker", () =>{

    const office = Cypress.env("despacho");

    let user;

    const data = {
        start_date: "2023-03-01",
        finish_date: "2024-03-30",
    }

    before(() => {
        cy.fixture('userPortalEmpleado').then(data => {
            user = data;
        });
    });

    // OK
    it("should filter the tracking workday registers", () =>{
        cy.tracker_day_filter(data, office, user.userName, user.userPassword, false);
    });
});