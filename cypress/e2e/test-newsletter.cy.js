describe("Test Newsletter", ()=> {
    beforeEach(()=>{
        cy.visit("http://localhost:3000")
        cy.wait(500)
    })

    it("Test para que no puedan suscribirse a la news letter", () => {
        cy.getByData("email-input").type("john@example.com")
        cy.getByData("submit-button").click()
        cy.getByData("server-error-message").should("exist").contains("already exists. Please use a different email address.")
    })
})