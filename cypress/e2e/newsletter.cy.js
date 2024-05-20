describe("Funcionalidad de News Letter", () => {
    beforeEach(()=>{
        cy.visit("http://localhost:3000")
        cy.wait(500)
    })

    it("Permite al usuario suscribirse a la newsletter correctamente", ()=>{
        cy.getByData("email-input").type("pablo.insua.gerpe@gmail.com")
        cy.getByData("submit-button").click()
        cy.getByData("success-message").should("exist")
    })
    
    it("No permite al usuario utilizar un email invalido", () =>{
        cy.getByData("email-input").type("pablo")
        cy.getByData("submit-button").click()
        cy.getByData("success-message").should("not.exist")
        
    })
    
    it.only("Asegurarse que los usuarios no puedan anotarse a nuestro newsletter si ya lo estan", () => {
        cy.getByData("email-input").type("john@example.com")
        cy.getByData("submit-button").click()
    })
})