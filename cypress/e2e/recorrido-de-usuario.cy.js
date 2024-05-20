describe("Recorrido de usuario", () =>{
    /*Tarea 4*/
    it("Deberia poder encontrar un curso en la pagina inicial y completa las lecciones", () =>{
        cy.visit("http://localhost:3000")
        cy.getByData("course-0").find("a").contains("Get started").click()
        cy.location("pathname").should("equal", "/testing-your-first-application")
        cy.getByData("next-lesson-button").click()

        cy.location("pathname").should("equal", "/testing-your-first-application/app-install-and-overview")
        cy.getByData("challenge-answer-0").click()
        cy.getByData("next-lesson-button").should("exist").click()

        cy.location("pathname").should("eq", "/testing-your-first-application/installing-cypress-and-writing-our-first-test")
        cy.getByData("challenge-answer-0").click()
        cy.getByData("next-lesson-button").should("exist").click()
        
        cy.location("pathname").should("eq", "/testing-your-first-application/setting-up-data-before-each-test")
        cy.getByData("challenge-answer-0").click()
        cy.getByData("next-lesson-button").should("exist").contains("Complete Course").click()
    })
})