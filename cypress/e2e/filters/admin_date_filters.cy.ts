/// <reference types='cypress' />
 
describe("Testing the date filters in the workday tracker as admin", () =>{
 
    const office = Cypress.env("despacho");

    let user;

    const data = {
        start_date: "2023-03-01",
        finish_date: "2024-03-30",
    }

    //Function to check if a date is inside a range of 2 dates

    function dateInRange(date, start_date, finish_date) {
        return date >= start_date && date <= finish_date;
    }

    before(() => {
        cy.fixture('adminPortalEmpleado').then(data => {
            user = data;
        });
    });
    
    it("should filter the tracking workday registers", () =>{
        cy.tracker_day_filter(data, office, user.userName, user.userPassword, true);
    });
});