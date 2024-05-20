/// <reference types="Cypress" />

describe('Caso de creacion de comandos', () => {
    before(() => {
        cy.fixture("telefonos").then(function(telefonos){
            this.telefonos = telefonos
        })
    })

    beforeEach(() =>{
        cy.visit("https://demo.opencart.com/")
    })
    
    it("realizar compra de un telefono", function() {
        cy.get('div[id="narbar-menu"] li:contains("Phones & PDAs")').click()
        // cy.get('.product-thumb:has(.description:contains("HTC Touch HD")) .button-group button[aria-label="Add to Cart"]').click()
        //forEach de los articulos que tenemos en el json
        this.telefonos.articulo.forEach(function(art) {
            cy.addToCart(art);
            cy.pause()
        })
        
        cy.get(".btn-inverse").click({force: true})
        
        /*
        this.telefonos.articulo.forEach(function(art) {
            cy.verifyCart(art)
        })
        */
    })
    
    it("Verificacion de suma de monto total drop down de carrito de compras", function() {
        cy.get('div[id="narbar-menu"] li:contains("Phones & PDAs")').click()
        
        this.telefonos.articulo.forEach(function(art) {
            cy.addToCart(art);
            cy.pause()
        })
        
        cy.get(".btn-inverse").click({force: true})
        
        this.telefonos.articulo.forEach(function(art) {
            cy.verifyCart(art)
        })

        var suma = 0

        cy.get('tr:has(button) td:contains("$")').each(($el) => {
                const monto = $el.text()
                var precio = monto.replace('$', '')
                suma += Number(precio)
        })

        cy.get(".table.table-bordered :nth-child(4) :contains('$')").then(function($el) {
            const monto = $el.text()
            var total = monto.replace("$", "")
            expect(Number(total)).to.eq(suma) 
        })
    })

})