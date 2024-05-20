/// <reference types="Cypress"/>    

//Suite de casos que contiene cada caso 
describe('Testing XHR backend', function () {
    beforeEach(() => {
        // ingresamos a la pagina    
        cy.visit("https://example.cypress.io/commands/network-requests")
    })

    it("Boton GET", () => {
        //Escuchamos las peticiones GET
        cy.intercept("GET", "https://jsonplaceholder.cypress.io/comments/*").as("getComment")
        
        //Clicamos el boton de GET
        cy.get(".network-btn").click() 
    
        //  wait
        cy.wait("@getComment").its("response.statusCode").should('be.oneOf', [200,304])
        
        //cy.request()
    })
    
    it("Boton POST", () => {
        //Escuchamos las peticiones POST
        cy.intercept("POST", "**/comments").as("postComment")
        //Clicamos el boton de POST
        cy.get(".network-post").click()
        cy.wait("@postComment").should(({request, response}) => {
            expect(request.body).to.include('email')
            expect(request.headers).to.have.property('content-type')
            expect(response && response.body).to.have.property('name', 'Using POST in cy.intercept()')
            
        })
        //cy.request()
    })
    
    it("Boton PUT", () => {
        let mensaje = "Este es una mensaje de error que creamos nosotros"
        //Escuchamos las peticiones PUT
        cy.intercept({
            method: "PUT",
            url: "**/comments/*",
        }, {
            statusCode: 404,
            body: {error: mensaje},
            headers: {'access-contro-allow-origin': '*'},
            delay: 5000
        }).as('putComment')
        //Clicamos el boton de PUT
        cy.get(".network-put").click()

        cy.wait('@putComment')

        cy.get('.network-put-comment').should('contain', mensaje)
    })
})