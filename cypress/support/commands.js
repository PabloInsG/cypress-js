/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add("getByData", (selector) =>{
    return cy.get(`[data-test=${selector}]`)
})

Cypress.Commands.add("addToCart", (nombreProducto) => {
    cy.get(".product-thumb").as("contenedorDeProductos")
        
        cy.get("@contenedorDeProductos")
            .each(($el, index, $list) => {
                cy.get(':has(.description) h4 a').eq(index).then(function($el1) {
                    let producto =  $el1.text()
                    cy.log(producto)

                    if(producto.includes(nombreProducto)){
                        cy.log("Se ha encontrao el elemento buscado")
                        cy.get("@contenedorDeProductos").eq(index).find('.button-group button[aria-label="Add to Cart"]').click()
                    }
                })
            })
})

Cypress.Commands.add("verifyCart", (nombreProducto) => {
    cy.get("tr:has(button[onclick*='cart.remove']) td[class='text-left'] a")
        .each(($el, index, $list) => {
            cy.get("td[class='text-left'] a").eq(index).then(function ($el1) {
                let producto = $el1.text()
                cy.log(producto)
                cy.get("tr:has(button[onclick*='cart.remove'])").should('contain.text', nombreProducto)
            })
        })
})