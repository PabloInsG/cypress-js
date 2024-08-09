/// <reference types='cypress' />
 
describe("Testing changes in the user configuration", () =>{

    const office = Cypress.env('despacho');

    let user

    before(() => {
        cy.fixture('userPortalEmpleado').then(data => {
            user = data;
        });
    });
 
    it("the date format should be changed correctly", () =>{
        cy.newDateFormatConfig(office, user.userName, user.userPassword);
    });
});