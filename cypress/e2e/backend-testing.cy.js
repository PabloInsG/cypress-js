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
    
        // https://on.cypress.io/wait
        cy.wait("@getComment").its("response.statusCode").should('be.oneOf', [200,304])
    })
    
    it("Boton POST", () => {
        //Escuchamos las peticiones POST
        cy.intercept("POST", "**/comments").as("postComment")
        
        //Clicamos el boton de POST
        cy.get(".network-post").click()

        cy.wait("@postComment").should(({request, response}) => {
            //En el body del request debe incluir el campo 'email'
            expect(request.body).to.include('email')

            //En los headers del request debe tener la propiedad 'content-type'
            expect(request.headers).to.have.property('content-type')

            //En el cuerpo de la respuesta o en la respuesta en si debe tener la propiedad 'name' que contenga el texto indicado
            expect(response && response.body).to.have.property('name', 'Using POST in cy.intercept()')
        })
    })
    
    it("Boton PUT", () => {
        let mensaje = "Este es una mensaje de error que creamos nosotros"
        
        //Cortamos las peticiones PUT
        cy.intercept({
            //Metodo PUT en este caso
            method: "PUT",
            //URL donde va a consultar el PUT
            url: "**/comments/*",
        }, {
            //Status Code que tiene que devolver
            statusCode: 404,
            //El mensaje que queremos que contenga
            body: {error: mensaje},
            headers: {'access-contro-allow-origin': '*'},
            //Añadimos retraso a la respuesta
            delay: 500
        }).as('putComment')

        //Clicamos el boton de PUT
        cy.get(".network-put").click()

        // https://on.cypress.io/wait
        cy.wait('@putComment')

        // El <div> donde sale el mensaje/comentario deberia contener nuestro mensaje de error
        cy.get('.network-put-comment').should('contain', mensaje)
    })
})